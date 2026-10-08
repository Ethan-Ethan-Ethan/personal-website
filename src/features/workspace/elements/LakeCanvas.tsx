import { useEffect, useRef } from 'react';
import type { Mesh, OrthographicCamera, Scene, ShaderMaterial, Vector4, WebGLRenderer } from 'three';
import { useLakePointer } from './useLakePointer';
import { LAKE_PHASES, normalizePhase, type LakePhase } from '../core/lake-palette';

type Props = { phase: number };

export default function LakeCanvas({ phase }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pointer = useLakePointer(12);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined') return;
    if (!window.WebGLRenderingContext) { host.dataset.webgl = 'fallback'; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { host.dataset.webgl = 'reduced'; return; }
    let disposed = false;
    let cleanup = () => {};
    const boot = async () => {
      const THREE = await import('three');
      if (disposed) return;
      let gsap: { to: (target: object, vars: Record<string, unknown>) => { kill: () => void } } | null = null;
      try {
        gsap = (await import('gsap')).gsap;
      } catch {
        gsap = null;
      }
      if (disposed) return;
      let renderer: WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'high-performance' });
      } catch {
        host.dataset.webgl = 'fallback';
        return;
      }

      const scene: Scene = new THREE.Scene();
      const camera: OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const pick = (index: number): LakePhase => LAKE_PHASES[normalizePhase(index)];
      const target0 = pick(phaseRef.current);
      const cur = {
        skyA: new THREE.Color(target0.skyA),
        skyB: new THREE.Color(target0.skyB),
        waterA: new THREE.Color(target0.waterA),
        waterB: new THREE.Color(target0.waterB),
        sun: new THREE.Color(target0.sun),
        sunPos: target0.sunPos[0] as number,
        sunPosY: target0.sunPos[1] as number,
        exposure: target0.exposure,
        glint: target0.glint,
      };
      const tmpColor = new THREE.Color();
      const screenU = new THREE.Vector2(1, 1);

      const ripples: Vector4[] = Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, 0, 0));
      const material: ShaderMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSkyA: { value: cur.skyA },
          uSkyB: { value: cur.skyB },
          uWaterA: { value: cur.waterA },
          uWaterB: { value: cur.waterB },
          uSun: { value: cur.sun },
          uSunPos: { value: new THREE.Vector2(cur.sunPos, cur.sunPosY) },
          uExposure: { value: cur.exposure },
          uGlint: { value: cur.glint },
          uBed: { value: null },
          uUseBed: { value: 0 },
          uScreen: { value: screenU },
          uTexAspect: { value: 4 / 3 },
          uRipples: { value: ripples },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime;
          uniform vec3 uSkyA; uniform vec3 uSkyB; uniform vec3 uWaterA; uniform vec3 uWaterB; uniform vec3 uSun;
          uniform vec2 uSunPos; uniform float uExposure; uniform vec4 uRipples[12]; uniform float uGlint;
          uniform sampler2D uBed; uniform float uUseBed; uniform vec2 uScreen; uniform float uTexAspect;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
          float fbm(vec2 p){float v=0.; float a=.5; for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+17.2;a*=.5;} return v;}
          vec2 coverUv(vec2 uv){
            float screenAspect=uScreen.x/uScreen.y;
            vec2 s=screenAspect>uTexAspect?vec2(1.0,uTexAspect/screenAspect):vec2(screenAspect/uTexAspect,1.0);
            return (uv-0.5)*s+0.5;
          }
          void main(){
            // 河床照片＋水層：床靜止，水紋往屏幕下方流；時段管水光。
            vec2 uv=vUv;
            vec2 flowUv=uv+vec2(0.0,uTime*0.030);
            float n=fbm(flowUv*vec2(6.0,14.0)+vec2(uTime*0.05,uTime*0.12));
            float detail=fbm(flowUv*vec2(26.0,44.0)+vec2(-uTime*0.09,uTime*0.22));
            float w=0.0; vec2 refr=vec2(0.0);
            for(int i=0;i<12;i++){
              vec4 r=uRipples[i];
              float age=uTime-r.z;
              float amp=r.w*step(0.0,age)*exp(-age*1.5);
              float d=distance(uv,r.xy);
              float grow=clamp((r.w-0.35)/1.5,0.0,1.0);
              float R=mix(260.0,90.0,grow);
              float K=mix(85.0,55.0,grow);
              float ring=amp*exp(-d*d*R)*sin(d*K-age*9.0);
              // 方向性明暗：朝光面亮、背光面暗，随 uSunPos（時段）走。
              vec2 toFrag=(uv-r.xy)/max(d,1e-3);
              vec2 toLight=uSunPos-r.xy;
              float dl=dot(toFrag,toLight/max(length(toLight),1e-3));
              w+=ring*(0.6+0.9*dl);
              refr+=(uv-r.xy)*ring*0.035;
            }
            vec2 bedUv=coverUv(uv)+(vec2(n,detail)-0.5)*0.010+refr;
            vec3 bedTex=texture2D(uBed,bedUv).rgb;
            vec3 procBase=mix(uWaterA,uWaterB,pow(uv.y,0.7));
            vec3 bed=mix(procBase,bedTex,uUseBed);
            float depth=smoothstep(0.0,1.0,uv.y);
            vec3 col=bed*(0.55+0.45*uExposure);
            col=mix(col,col*uSun+uWaterB*0.15,0.35);
            col=mix(col,uWaterB,depth*0.45);
            float streak=exp(-pow((uv.x-uSunPos.x)*6.0,2.0))*(0.35+0.65*uv.y);
            col+=uSun*streak*(0.20+0.34*n+0.30*detail)*uGlint;
            col+=uSun*w*0.7*uGlint;
            col*=uExposure;
            gl_FragColor=vec4(col,1.0);
          }
        `,
      });

      // 河床圖：就緒前保持程序底（uUseBed=0），5 秒載不到就維持程序底。
      const loadBed = (): Promise<void> => new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        try {
          new THREE.TextureLoader().load(
            '/assets/lake/riverbed-25.png',
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              try {
                t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
                const w = t.image.width as number;
                const h = t.image.height as number;
                if (w > 0 && h > 0) material.uniforms.uTexAspect.value = w / h;
              } catch { /* keep defaults */ }
              material.uniforms.uBed.value = t;
              material.uniforms.uUseBed.value = 1;
              finish();
            },
            undefined,
            () => finish(),
          );
          window.setTimeout(finish, 5000);
        } catch {
          finish();
        }
      });
      await loadBed();
      if (disposed) return;

      const quad: Mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      quad.frustumCulled = false;
      scene.add(quad);

      let animationId = 0;
      let visible = !document.hidden;
      let motionReduced = false;
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onMotionChange = () => {
        if (motionQuery.matches) {
          motionReduced = true;
          host.dataset.webgl = 'reduced';
        }
      };

      const resize = () => {
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const mobile = width < 768;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.55));
        // updateStyle 必須 true：false 會讓 canvas 按繪圖像素顯示（dpr 倍溢出），全屏錯位。
        renderer.setSize(width, height, true);
        screenU.set(width, height);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const onVisibility = () => {
        visible = !document.hidden;
        if (visible && !animationId) animate(performance.now());
      };
      let lastPush = -1;
      let lastPX = -1;
      let lastPY = -1;
      const onLakePointer = (event: PointerEvent) => {
        if (!pointer.enabled) return;
        const rect = host.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
        const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);
        const now = (performance.now() - startedAt) / 1000;
        if (now - lastPush < 0.05) return;
        if (lastPX >= 0 && Math.hypot(x - lastPX, y - lastPY) < 0.02) return;
        lastPush = now;
        lastPX = x;
        lastPY = y;
        pointer.push(x, y, now, 0.35);
      };
      let lastSplash = -1;
      const onLakeSplash = (event: PointerEvent) => {
        if (!pointer.enabled) return;
        const rect = host.getBoundingClientRect();
        const now = (performance.now() - startedAt) / 1000;
        if (now - lastSplash < 0.15) return;
        lastSplash = now;
        pointer.push(
          (event.clientX - rect.left) / Math.max(rect.width, 1),
          1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
          now,
          1.8,
        );
      };
      document.addEventListener('visibilitychange', onVisibility);
      motionQuery.addEventListener('change', onMotionChange);
      host.addEventListener('pointermove', onLakePointer, { passive: true });
      host.addEventListener('pointerdown', onLakeSplash, { passive: true });

      let lastTime = performance.now();
      const startedAt = lastTime;
      // GSAP 統管過渡（Minh 前例：同套 easing 語言管 DOM＋shader）；gsap 缺席即硬切。
      type Snap = { skyA: InstanceType<typeof THREE.Color>; skyB: InstanceType<typeof THREE.Color>; waterA: InstanceType<typeof THREE.Color>; waterB: InstanceType<typeof THREE.Color>; sun: InstanceType<typeof THREE.Color>; sunX: number; sunY: number; exposure: number; glint: number };
      const snap = (): Snap => ({ skyA: cur.skyA.clone(), skyB: cur.skyB.clone(), waterA: cur.waterA.clone(), waterB: cur.waterB.clone(), sun: cur.sun.clone(), sunX: cur.sunPos, sunY: cur.sunPosY, exposure: cur.exposure, glint: cur.glint });
      let from: Snap = snap();
      let activeIdx = normalizePhase(phaseRef.current);
      let activeRec: LakePhase = pick(activeIdx);
      const prog = { t: 1 };
      let tween: { kill: () => void } | null = null;
      const retarget = (next: LakePhase) => {
        from = snap();
        activeRec = next;
        prog.t = 0;
        tween?.kill();
        tween = null;
        if (gsap) tween = gsap.to(prog, { t: 1, duration: 0.9, ease: 'power2.inOut' });
        else prog.t = 1;
      };

      const animate = (time: number) => {
        animationId = 0;
        if (!visible || motionReduced) return;
        const delta = Math.min(time - lastTime, 40);
        lastTime = time;
        void delta;
        const elapsed = (time - startedAt) / 1000;
        material.uniforms.uTime.value = elapsed;
        const want = normalizePhase(phaseRef.current);
        if (want !== activeIdx) {
          activeIdx = want;
          retarget(pick(want));
        }
        const e = prog.t;
        const to = activeRec;
        cur.skyA.copy(from.skyA).lerp(tmpColor.set(to.skyA), e);
        cur.skyB.copy(from.skyB).lerp(tmpColor.set(to.skyB), e);
        cur.waterA.copy(from.waterA).lerp(tmpColor.set(to.waterA), e);
        cur.waterB.copy(from.waterB).lerp(tmpColor.set(to.waterB), e);
        cur.sun.copy(from.sun).lerp(tmpColor.set(to.sun), e);
        cur.sunPos = from.sunX + (to.sunPos[0] - from.sunX) * e;
        cur.sunPosY = from.sunY + (to.sunPos[1] - from.sunY) * e;
        cur.exposure = from.exposure + (to.exposure - from.exposure) * e;
        cur.glint = from.glint + (to.glint - from.glint) * e;
        (material.uniforms.uSunPos.value as { x: number; y: number }).x = cur.sunPos;
        (material.uniforms.uSunPos.value as { x: number; y: number }).y = cur.sunPosY;
        material.uniforms.uExposure.value = cur.exposure;
        material.uniforms.uGlint.value = cur.glint;
        const items = pointer.list;
        for (let i = 0; i < 12; i++) {
          const r = items[i];
          if (r) ripples[i].set(r.x, r.y, r.t0, r.amp);
          else ripples[i].set(0, 0, 0, 0);
        }
        renderer.render(scene, camera);
        if (!motionReduced) animationId = requestAnimationFrame(animate);
      };
      animate(performance.now());

      cleanup = () => {
        tween?.kill();
        tween = null;
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        motionQuery.removeEventListener('change', onMotionChange);
        host.removeEventListener('pointermove', onLakePointer);
        host.removeEventListener('pointerdown', onLakeSplash);
        document.removeEventListener('visibilitychange', onVisibility);
        const bed = material.uniforms.uBed.value as unknown as { dispose?: () => void } | null;
        try { bed?.dispose?.(); } catch { /* keep going */ }
        scene.traverse((object) => {
          if ('geometry' in object) (object as Mesh).geometry?.dispose?.();
          if ('material' in object) {
            const mat = (object as Mesh).material;
            (Array.isArray(mat) ? mat : [mat]).forEach((item) => item?.dispose?.());
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };
    let cancelStart = () => {};
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => void boot(), { timeout: 900 });
      cancelStart = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(() => void boot(), 180);
      cancelStart = () => window.clearTimeout(id);
    }
    return () => { disposed = true; cancelStart(); cleanup(); };
  }, []);

  return <div ref={hostRef} className="lake-canvas" aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />;
}
