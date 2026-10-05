import { useEffect, useRef } from 'react';
import type { LineBasicMaterial, Mesh, Points, WebGLRenderer } from 'three';

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export default function GalaxyCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

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
      const reduceMotion = false;
    let renderer: WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    } catch {
      host.dataset.webgl = 'fallback';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.z = 8;
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const random = seededRandom(424242);
    const starGroups: Points[] = [];
    const layerSpecs = [
      { count: 420, size: 0.024, spread: 14, z: -4, speed: 0.000025 },
      { count: 240, size: 0.038, spread: 11, z: -1, speed: 0.00005 },
      { count: 100, size: 0.065, spread: 9, z: 1, speed: 0.00009 },
    ];
    for (const spec of layerSpecs) {
      const positions = new Float32Array(spec.count * 3);
      for (let index = 0; index < positions.length; index += 3) {
        positions[index] = (random() - 0.5) * spec.spread;
        positions[index + 1] = (random() - 0.5) * spec.spread * 0.58;
        positions[index + 2] = spec.z + (random() - 0.5) * 2;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: spec.z > 0 ? 0xffe3b3 : 0xbcd7ff,
        size: spec.size,
        transparent: true,
        opacity: spec.z > 0 ? 0.94 : 0.72,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(geometry, material);
      stars.userData.speed = spec.speed;
      scene.add(stars);
      starGroups.push(stars);
    }

    const nebulaMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uColorA: { value: new THREE.Color('#4253a6') }, uColorB: { value: new THREE.Color('#c76fa7') } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        varying vec2 vUv; uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
        float fbm(vec2 p){float v=0.; float a=.5; for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+17.2;a*=.5;} return v;}
        void main(){vec2 uv=vUv-.5; float n=fbm(uv*3.2+vec2(uTime*.012,-uTime*.008)); float glow=1.0 - smoothstep(.18,.62,length(uv*vec2(.72,1.))); vec3 color=mix(uColorA,uColorB,n); float alpha=glow*smoothstep(.32,.84,n)*.48; gl_FragColor=vec4(color,alpha);}
      `,
    });
    const nebula = new THREE.Mesh(new THREE.PlaneGeometry(12, 7), nebulaMaterial);
    nebula.position.z = -2.5;
    nebula.rotation.z = -0.15;
    scene.add(nebula);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(0.92, 40, 24),
      new THREE.MeshStandardMaterial({ color: '#7f6fc2', roughness: 0.8, metalness: 0.05, emissive: '#241f58', emissiveIntensity: 0.5 }),
    );
    planet.position.set(3.2, 1.55, -0.8);
    scene.add(planet);
    const light = new THREE.PointLight('#ffe0b6', 7, 20);
    light.position.set(1.3, 3.6, 4);
    scene.add(light, new THREE.AmbientLight('#7888dd', 1.6));

    const meteorGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1.2, -0.45, 0)]);
    const meteor = new THREE.Line(meteorGeometry, new THREE.LineBasicMaterial({ color: '#fff2d4', transparent: true, opacity: 0 }));
    meteor.position.set(5, 2.4, 1.5);
    scene.add(meteor);

    let pointerX = 0;
    let pointerY = 0;
    let animationId = 0;
    let visible = !document.hidden;
    // threeui borrow (energy-orb pattern): react to mid-session
    // prefers-reduced-motion changes instead of checking once at boot.
    let motionReduced = false;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (motionQuery.matches) {
        motionReduced = true;
        host.dataset.webgl = 'reduced';
      }
    };
    let meteorStart = 8;
    let lastTime = performance.now();
    const startedAt = lastTime;

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const mobile = width < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.55));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && !animationId) animate(performance.now());
    };
    host.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);

    const animate = (time: number) => {
      animationId = 0;
      if (!visible || motionReduced) return;
      const delta = Math.min(time - lastTime, 40);
      lastTime = time;
      const elapsed = (time - startedAt) / 1000;
      nebulaMaterial.uniforms.uTime.value = elapsed;
      starGroups.forEach((stars) => { stars.rotation.z += stars.userData.speed * delta; });
      planet.rotation.y += 0.00007 * delta;
      if (!reduceMotion) {
        camera.position.x += (pointerX * 0.14 - camera.position.x) * 0.025;
        camera.position.y += (-pointerY * 0.1 - camera.position.y) * 0.025;
      }
      if (!reduceMotion && elapsed > meteorStart) {
        const phase = (elapsed - meteorStart) / 1.35;
        if (phase <= 1) {
          meteor.position.set(5 - phase * 8, 2.4 - phase * 3.2, 1.5);
          (meteor.material as LineBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.85;
        } else {
          (meteor.material as LineBasicMaterial).opacity = 0;
          meteorStart += 12 + random() * 16;
        }
      }
      renderer.render(scene, camera);
      if (!reduceMotion && !motionReduced) animationId = requestAnimationFrame(animate);
    };
    animate(performance.now());

    cleanup = () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      host.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((object) => {
        if ('geometry' in object) (object as Mesh).geometry?.dispose?.();
        if ('material' in object) {
          const material = (object as Mesh).material;
          (Array.isArray(material) ? material : [material]).forEach((item) => item?.dispose?.());
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

  return <div ref={hostRef} className="galaxy-canvas" aria-hidden="true" />;
}
