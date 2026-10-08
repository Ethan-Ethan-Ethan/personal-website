import { useEffect, useRef } from 'react';
import type { Mesh, OrthographicCamera, Scene, ShaderMaterial, Vector4, WebGLRenderer } from 'three';

export type LakePalette = {
  skyA: string;
  skyB: string;
  waterA: string;
  waterB: string;
  sun: string;
  sunPos: [number, number];
  exposure: number;
};

// Task 4 會搬進 lake-palette.ts＋GSAP 接管；此處僅 Task 2 基座用暫定值。
const DEFAULT_PALETTES: LakePalette[] = [
  { skyA: '#2b3a5e', skyB: '#e8a06a', waterA: '#3a4a6b', waterB: '#141c33', sun: '#ffd9a0', sunPos: [0.5, 0.62], exposure: 1.0 },
  { skyA: '#3f7ec2', skyB: '#bcd9ef', waterA: '#2e6b8f', waterB: '#0f2f47', sun: '#fff4d6', sunPos: [0.5, 0.78], exposure: 1.05 },
  { skyA: '#3a2b5c', skyB: '#ef7d54', waterA: '#4a3560', waterB: '#1a1430', sun: '#ffb36b', sunPos: [0.5, 0.56], exposure: 1.0 },
  { skyA: '#060913', skyB: '#16233d', waterA: '#0d1626', waterB: '#04070f', sun: '#cfe0ff', sunPos: [0.68, 0.7], exposure: 0.95 },
];

type Props = { phase: number };

export default function LakeCanvas({ phase }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

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

      const pick = (index: number): LakePalette => DEFAULT_PALETTES[((index % 4) + 4) % 4];
      const target = pick(phaseRef.current);
      const cur = {
        skyA: new THREE.Color(target.skyA),
        skyB: new THREE.Color(target.skyB),
        waterA: new THREE.Color(target.waterA),
        waterB: new THREE.Color(target.waterB),
        sun: new THREE.Color(target.sun),
        sunPos: target.sunPos[0] as number,
        sunPosY: target.sunPos[1] as number,
        exposure: target.exposure,
      };
      const tmpColor = new THREE.Color();

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
          uRipples: { value: ripples },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime;
          uniform vec3 uSkyA; uniform vec3 uSkyB; uniform vec3 uWaterA; uniform vec3 uWaterB; uniform vec3 uSun;
          uniform vec2 uSunPos; uniform float uExposure; uniform vec4 uRipples[12];
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
          float fbm(vec2 p){float v=0.; float a=.5; for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+17.2;a*=.5;} return v;}
          void main(){
            vec2 uv=vUv; float horizon=0.52; vec3 col;
            if(uv.y>horizon){
              float t=(uv.y-horizon)/(1.0-horizon);
              col=mix(uSkyB,uSkyA,pow(t,0.8));
              col+=uSun*exp(-dot(uv-uSunPos,uv-uSunPos)*36.0)*0.9;
              col+=uSun*fbm(uv*4.0+vec2(uTime*0.008,0.0))*0.03;
            } else {
              float t=(horizon-uv.y)/horizon;
              vec3 base=mix(uWaterA,uWaterB,pow(t,0.65));
              float n=fbm(uv*vec2(6.0,14.0)+vec2(uTime*0.05,uTime*0.12));
              float streak=exp(-pow((uv.x-uSunPos.x)*7.0,2.0))*(1.0-t);
              col=base+uSun*streak*(0.22+0.38*n);
              float w=0.0;
              for(int i=0;i<12;i++){
                vec4 r=uRipples[i];
                float age=uTime-r.z;
                float amp=r.w*step(0.0,age)*exp(-age*1.5);
                float d=distance(uv,r.xy);
                w+=amp*exp(-d*d*320.0)*sin(d*90.0-age*10.0);
              }
              col+=uSun*w*0.6;
            }
            col*=uExposure;
            gl_FragColor=vec4(col,1.0);
          }
        `,
      });
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
        renderer.setSize(width, height, false);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const onVisibility = () => {
        visible = !document.hidden;
        if (visible && !animationId) animate(performance.now());
      };
      document.addEventListener('visibilitychange', onVisibility);
      motionQuery.addEventListener('change', onMotionChange);

      let lastTime = performance.now();
      const startedAt = lastTime;
      const damp = (color: { r: number; g: number; b: number }, targetHex: string, k: number) => {
        tmpColor.set(targetHex);
        color.r += (tmpColor.r - color.r) * k;
        color.g += (tmpColor.g - color.g) * k;
        color.b += (tmpColor.b - color.b) * k;
      };

      const animate = (time: number) => {
        animationId = 0;
        if (!visible || motionReduced) return;
        const delta = Math.min(time - lastTime, 40);
        lastTime = time;
        const elapsed = (time - startedAt) / 1000;
        material.uniforms.uTime.value = elapsed;
        const next = pick(phaseRef.current);
        const k = 1 - Math.exp((-delta / 1000) * 3);
        damp(cur.skyA, next.skyA, k);
        damp(cur.skyB, next.skyB, k);
        damp(cur.waterA, next.waterA, k);
        damp(cur.waterB, next.waterB, k);
        damp(cur.sun, next.sun, k);
        cur.sunPos += (next.sunPos[0] - cur.sunPos) * k;
        cur.sunPosY += (next.sunPos[1] - cur.sunPosY) * k;
        cur.exposure += (next.exposure - cur.exposure) * k;
        (material.uniforms.uSunPos.value as { x: number; y: number }).x = cur.sunPos;
        (material.uniforms.uSunPos.value as { x: number; y: number }).y = cur.sunPosY;
        material.uniforms.uExposure.value = cur.exposure;
        renderer.render(scene, camera);
        if (!motionReduced) animationId = requestAnimationFrame(animate);
      };
      animate(performance.now());

      cleanup = () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        motionQuery.removeEventListener('change', onMotionChange);
        document.removeEventListener('visibilitychange', onVisibility);
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

  return <div ref={hostRef} className="lake-canvas" aria-hidden="true" />;
}
