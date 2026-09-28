/**
 * The hero: the Oche mark in 3D, with commits streaming through it.
 *
 * The mark is seven extruded bands (ember on the odd ones, like the logo), so
 * they can slide in from alternating sides, lock into the O, and fan apart as
 * you scroll away. Three rails in the stage colours (dev, staging, prod) run
 * from deep in the scene through the O's counter; small lit packets travel
 * along them. An oche is the line you throw from, and everything passes
 * through it.
 *
 * Plain three.js, no React: the component only mounts it, feeds it the pointer
 * and scroll, and stops the loop when the hero is off screen.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const BG = 0x0c0b0a;
const CREAM = 0xf3efea;
const EMBER = 0xff6a42;
const STAGES = [0x9d91ff, 0xf5b83d, 0x3ddc84] as const;

/* ---------------- the mark's outline, in the logo's own units ---------------- */

// Same numbers as components/logo.tsx: a 19×21 rounded O with a 3.7×5.9 counter, cut into 7 bands.
const HX = 19 / 2;
const HY = 21 / 2;
const R = 8.6;
const RX = 3.7;
const RY = 5.9;
const BANDS = 7;
const BAND = (HY * 2) / BANDS;
const SAMPLES = 20;

const outerX = (y: number) => {
  const dy = Math.abs(y) - (HY - R);
  return dy <= 0 ? HX : HX - R + Math.sqrt(Math.max(0, R * R - dy * dy));
};
const innerX = (y: number) => (Math.abs(y) < RY ? RX * Math.sqrt(1 - (y / RY) ** 2) : 0);

function range(a: number, b: number, n = SAMPLES) {
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}

/** The outline(s) of one band, centred on its own middle so it can spin in place. */
function bandShapes(y0: number, y1: number): THREE.Shape[] {
  const yc = (y0 + y1) / 2;
  const pt = (x: number, y: number) => new THREE.Vector2(x, y - yc);
  const holeAll = Math.abs(y0) < RY && Math.abs(y1) < RY;
  const holeNone = y0 >= RY || y1 <= -RY;

  if (holeNone) {
    const pts = [...range(y0, y1).map((y) => pt(outerX(y), y)), ...range(y1, y0).map((y) => pt(-outerX(y), y))];
    return [new THREE.Shape(pts)];
  }
  if (holeAll) {
    const right = [...range(y0, y1).map((y) => pt(outerX(y), y)), ...range(y1, y0).map((y) => pt(innerX(y), y))];
    const left = right.map((p) => new THREE.Vector2(-p.x, p.y)).reverse();
    return [new THREE.Shape(right), new THREE.Shape(left)];
  }
  // The counter's tip pokes into this band: one piece with a notch.
  if (y1 > RY) {
    // Notch opens downward (band above the middle).
    const pts = [
      ...range(y0, y1).map((y) => pt(outerX(y), y)),
      ...range(y1, y0).map((y) => pt(-outerX(y), y)),
      ...range(y0, RY).map((y) => pt(-innerX(y), y)),
      ...range(RY, y0).map((y) => pt(innerX(y), y)),
    ];
    return [new THREE.Shape(pts)];
  }
  const pts = [
    ...range(y0, y1).map((y) => pt(outerX(y), y)),
    ...range(y1, -RY).map((y) => pt(innerX(y), y)),
    ...range(-RY, y1).map((y) => pt(-innerX(y), y)),
    ...range(y1, y0).map((y) => pt(-outerX(y), y)),
  ];
  return [new THREE.Shape(pts)];
}

/* ---------------- easing ---------------- */

const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const damp = (from: number, to: number, lambda: number, dt: number) => from + (to - from) * (1 - Math.exp(-lambda * dt));

/* ---------------- shaders ---------------- */

const railShader = (color: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOffset: { value: Math.random() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOffset;
      varying vec2 vUv;
      void main() {
        float u = vUv.x;
        float ends = smoothstep(0.0, 0.35, u) * smoothstep(1.0, 0.75, u);
        float flow = pow(fract(u * 2.0 - uTime * 0.18 + uOffset), 14.0);
        float a = ends * (0.16 + flow * 0.9);
        gl_FragColor = vec4(uColor * (0.8 + flow * 2.2), a);
      }`,
  });

const floorShader = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      void main() {
        vec2 g = vWorld.xz * 1.1;
        g.y += uTime * 0.35;
        vec2 grid = abs(fract(g - 0.5) - 0.5) / fwidth(g);
        float line = 1.0 - min(min(grid.x, grid.y), 1.0);
        float fade = exp(-length(vWorld.xz - vec2(0.0, -3.0)) * 0.16);
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.9), line * 0.11 * fade);
      }`,
  });

/* ---------------- the scene ---------------- */

export interface HeroScene {
  setSize(width: number, height: number): void;
  /** Pointer in -1..1 on both axes, 0 at the centre. */
  setPointer(x: number, y: number): void;
  /** 0 while the hero fills the screen, 1 once it has scrolled away. */
  setScroll(progress: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

export function createHeroScene(canvas: HTMLCanvasElement, { reducedMotion }: { reducedMotion: boolean }): HeroScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 9, 22);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0.25, 7.2);

  const key = new THREE.DirectionalLight(0xfff1e6, 1.6);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(EMBER, 2.2);
  rim.position.set(4, -1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.08));

  /* rig: everything that moves with the pointer */
  const rig = new THREE.Group();
  scene.add(rig);

  /* the mark */
  const MARK_SCALE = 0.064;
  const mark = new THREE.Group();
  mark.scale.setScalar(MARK_SCALE);
  rig.add(mark);

  const cream = new THREE.MeshPhysicalMaterial({ color: CREAM, roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 });
  const ember = new THREE.MeshPhysicalMaterial({
    color: EMBER,
    emissive: 0xff3d12,
    emissiveIntensity: 0.35,
    roughness: 0.32,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  });

  const DEPTH = 4.2;
  const GAP = 0.18;
  const bands: { mesh: THREE.Mesh; baseY: number; side: number }[] = [];
  for (let i = 0; i < BANDS; i++) {
    const top = HY - i * BAND;
    const y0 = top - BAND + GAP / 2;
    const y1 = top - GAP / 2;
    const geometry = new THREE.ExtrudeGeometry(bandShapes(y0, y1), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.3,
      bevelOffset: -0.3,
      bevelSegments: 5,
      curveSegments: 8,
    });
    geometry.translate(0, 0, -DEPTH / 2);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, i % 2 ? ember : cream);
    const baseY = (y0 + y1) / 2;
    mesh.position.y = baseY;
    mark.add(mesh);
    bands.push({ mesh, baseY, side: i % 2 ? 1 : -1 });
  }

  /* rails and packets */
  // Rails come from deep behind the mark and leave past the camera, away from the headline.
  const RAILS: THREE.Vector3[][] = [
    [new THREE.Vector3(-2.6, 3.4, -16), new THREE.Vector3(-1.0, 1.3, -6), new THREE.Vector3(-0.05, 0.05, 0), new THREE.Vector3(1.1, -0.55, 2.6), new THREE.Vector3(3.2, -1.7, 4.6)],
    [new THREE.Vector3(3.2, 4.2, -17), new THREE.Vector3(1.0, 1.6, -6), new THREE.Vector3(0.0, 0.0, 0), new THREE.Vector3(-0.3, -0.95, 2.6), new THREE.Vector3(0.1, -2.7, 4.6)],
    [new THREE.Vector3(7, -1.3, -15), new THREE.Vector3(2.5, -0.45, -5.5), new THREE.Vector3(0.06, -0.05, 0), new THREE.Vector3(-0.7, -0.6, 2.6), new THREE.Vector3(-1.6, -2.4, 4.6)],
  ];
  const railMaterials: THREE.ShaderMaterial[] = [];
  const packets: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; t: number; speed: number }[] = [];
  const packetGeometry = new THREE.CapsuleGeometry(0.018, 0.22, 4, 8);
  packetGeometry.rotateX(Math.PI / 2);

  RAILS.forEach((points, r) => {
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const material = railShader(STAGES[r]!);
    railMaterials.push(material);
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.006, 6, false), material));

    const packetMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(STAGES[r]!).multiplyScalar(3.2), toneMapped: false });
    for (let k = 0; k < 4; k++) {
      const mesh = new THREE.Mesh(packetGeometry, packetMaterial);
      rig.add(mesh);
      packets.push({ mesh, curve, t: (k + r * 0.33) / 4, speed: 0.055 + r * 0.008 + k * 0.004 });
    }
  });

  /* floor and dust */
  const floorMaterial = floorShader();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.1;
  scene.add(floor);

  const DUST = 420;
  const dustPositions = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 22;
    dustPositions[i * 3 + 1] = Math.random() * 7 - 2;
    dustPositions[i * 3 + 2] = -Math.random() * 18 + 3;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: 0xffe9dc, size: 0.018, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false }),
  );
  scene.add(dust);

  /* post */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Threshold above 1: only the packets, rails and hot highlights glow, not the whole mark.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.55, 1.05);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* state */
  let width = 1;
  let height = 1;
  let running = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  const intro = { start: -1, done: reducedMotion };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scroll = 0;
  let scrollSmooth = 0;
  const layout = { x: 0, y: 0, scale: 1 };

  function place() {
    const aspect = width / height;
    const dist = camera.position.z;
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    const visW = visH * aspect;
    if (aspect > 1.05) {
      // Desktop: the mark sits to the right of the headline.
      layout.x = Math.min(visW * 0.28, 2.9);
      layout.y = 0.1;
      layout.scale = 1;
    } else {
      // Phones: above the headline, a bit smaller.
      layout.x = 0;
      layout.y = visH * 0.3;
      layout.scale = 0.52;
    }
  }

  function update(dt: number) {
    elapsed += dt;
    // The entrance runs on the wall clock, so a slow device still gets it in two seconds.
    const now = performance.now() / 1000;
    if (intro.start < 0) intro.start = now;
    const t = now - intro.start;

    pointer.sx = damp(pointer.sx, pointer.x, 3.2, dt);
    pointer.sy = damp(pointer.sy, pointer.y, 3.2, dt);
    scrollSmooth = damp(scrollSmooth, scroll, 6, dt);
    const s = scrollSmooth;

    // Idle sway plus the pointer, springy enough to feel alive.
    const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.35) * 0.16;
    rig.position.set(layout.x, layout.y + (reducedMotion ? 0 : Math.sin(elapsed * 0.7) * 0.035) + s * 0.6, 0);
    rig.scale.setScalar(layout.scale * (1 - s * 0.12));
    rig.rotation.y = -0.55 + sway + pointer.sx * 0.32 + s * 0.5;
    rig.rotation.x = 0.12 - pointer.sy * 0.16 + s * 0.25;

    // Bands: slide in from alternating sides, lock, then fan apart on scroll.
    bands.forEach((b, i) => {
      const p = intro.done ? 1 : expoOut(clamp01((t - 0.15 - i * 0.075) / 1.35));
      const out = 1 - p;
      const fan = s * (i - 3);
      b.mesh.position.x = b.side * out * 90;
      b.mesh.position.y = b.baseY * (1 + s * 0.55) + out * (i - 3) * 2;
      b.mesh.position.z = out * -40 + fan * 3.2;
      b.mesh.rotation.y = b.side * out * 1.4 + b.side * s * 0.55;
      b.mesh.rotation.x = out * 0.6;
      b.mesh.rotation.z = b.side * s * 0.06;
    });
    if (!intro.done && t > 0.15 + BANDS * 0.075 + 1.4) intro.done = true;

    // Packets ride the rails and shrink away at the ends.
    const ahead = new THREE.Vector3();
    rig.updateMatrixWorld();
    for (const p of packets) {
      if (!reducedMotion) p.t = (p.t + p.speed * dt) % 1;
      const pos = p.curve.getPointAt(p.t);
      p.mesh.position.copy(pos);
      p.curve.getPointAt(Math.min(0.999, p.t + 0.01), ahead);
      p.mesh.lookAt(ahead.applyMatrix4(rig.matrixWorld));
      const edge = Math.min(p.t / 0.12, (1 - p.t) / 0.12, 1);
      p.mesh.scale.setScalar(Math.max(0.001, edge));
    }

    for (const m of railMaterials) m.uniforms.uTime!.value = elapsed;
    floorMaterial.uniforms.uTime!.value = reducedMotion ? 0 : elapsed;
    if (!reducedMotion) dust.rotation.y = elapsed * 0.01;

    camera.position.y = 0.25 - s * 0.4;
    camera.lookAt(0, -s * 0.2, 0);
  }

  function render() {
    rig.updateMatrixWorld();
    composer.render();
  }

  function loop(now: number) {
    if (!running) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    update(dt);
    render();
    frame = requestAnimationFrame(loop);
  }

  return {
    setSize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      const dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      bloom.resolution.set(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      place();
      if (!running) {
        update(0);
        render();
      }
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      if (reducedMotion && !running) {
        pointer.sx = x;
        pointer.sy = y;
      }
    },
    setScroll(p) {
      scroll = clamp01(p);
      if (reducedMotion) {
        scrollSmooth = scroll;
        update(0);
        render();
      }
    },
    start() {
      if (running || reducedMotion) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose();
      });
      envTexture.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
