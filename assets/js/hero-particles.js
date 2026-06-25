// Hero particle field — exact port of the "BreathDearMedusae" three.js effect
// (breathing jellyfish halo of Google-coloured pills that the field follows like a
// magnet). The GLSL shaders below are reproduced verbatim from the reference's
// react-three-fiber component; only the React/R3F scaffolding is reimplemented in
// vanilla three.js so it can run on this static page.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";

const canvas = document.querySelector("[data-particle-field]");
const host = canvas && (canvas.closest("section") || canvas.parentElement);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && host) {
  try {
    init();
  } catch (err) {
    // WebGL unavailable / blocked — leave the hero clean rather than throwing.
    console.warn("hero-particles: disabled", err);
  }
}

function init() {
  const FOV = 75;          // react-three-fiber default perspective fov
  const CAM_Z = 5;         // <Canvas camera={{ position: [0,0,5] }} />
  const DRAG = 0.055;      // "heavy" drag — focal point trails the cursor with weight

  const countX = 100;
  const countY = 55;
  const count = countX * countY;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0); // transparent → the hero gradient shows through

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1000);
  camera.position.set(0, 0, CAM_Z);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;

      attribute vec3 aOffset;
      attribute float aRandom;
      // aAngleOffset removed/unused for alignment

      #define PI 3.14159265359

      // Simple noise for extra organic feel
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        return mix( mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      mat2 rotate2d(float _angle){
        return mat2(cos(_angle), sin(_angle),
                    -sin(_angle), cos(_angle));
      }

      void main() {
        vUv = uv;

        // --- 1. ALIVE FLOW (Base layer) ---
        vec3 pos = aOffset;

        float driftSpeed = uTime * 0.15;

        // Curl-like flowing motion
        float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
        float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);

        // subtle constant movement
        pos.x += dx * 0.25;
        pos.y += dy * 0.25;

        // --- 2. THE JELLYFISH HALO (Smooth & Subtle) ---

        vec2 relToMouse = pos.xy - uMouse;
        float distFromMouse = length(relToMouse);
        float angleToMouse = atan(relToMouse.y, relToMouse.x);

        // Organic Halo Shape
        float shapeFactor = noise(vec2(angleToMouse * 2.0, uTime * 0.1));

        // The "Breathing" is a slow expansion/contraction of the Halo Radius
        float breathCycle = sin(uTime * 0.8); // Smooth -1 to 1

        // Radius breathes: 2.2 +/- 0.3
        float currentRadius = 2.2 + breathCycle * 0.3 + (shapeFactor * 0.5);

        // Interaction Ring Calculation
        float dist = distFromMouse;
        float rimWidth = 1.8; // Soft edge
        float rimInfluence = smoothstep(rimWidth, 0.0, abs(dist - currentRadius));

        // --- 3. WAVE MOVEMENT (Gentle Ripple) ---
        vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));

        float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5; // 0 to 0.5

        pos.xy += pushDir * pushAmt * rimInfluence;

        // 3D: Subtle Z float
        pos.z += rimInfluence * 0.3 * sin(uTime);

        // --- 4. SIZE & SCALE ---

        float baseSize = 0.012 + (sin(uTime + pos.x)*0.003);

        float activeSize = 0.055;
        float currentScale = baseSize + (rimInfluence * activeSize);

        float stretch = rimInfluence * 0.02;

        vec3 transformed = position;
        transformed.x *= (currentScale + stretch);
        transformed.y *= currentScale * 0.85;

        vSize = rimInfluence;
        vPos = pos.xy;

        // --- 5. ROTATION ---
        // Radial alignment: point toward the mouse field.
        float targetAngle = angleToMouse;
        float finalAngle = targetAngle;

        transformed.xy = rotate2d(finalAngle) * transformed.xy;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;

      void main() {
        // Shape: "Rectangle with radius"
        vec2 center = vec2(0.5);
        vec2 pos = abs(vUv - center) * 2.0;

        float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0/2.6);
        float alpha = 1.0 - smoothstep(0.8, 1.0, d);

        if (alpha < 0.01) discard;

        // B2B Drive brand palette — azure → indigo → violet (no off-brand red/yellow)
        vec3 base   = vec3(0.05, 0.07, 0.12);   // deep ink-blue at rest
        vec3 cAzure = vec3(0.18, 0.42, 1.00);   // #2f6bff
        vec3 cIndigo= vec3(0.31, 0.27, 0.90);   // #4f46e5
        vec3 cViolet= vec3(0.49, 0.36, 0.96);   // #7c3aed (lifted for glow)

        // --- Dynamic Color Shifting ---
        float t = uTime * 1.0; // calmer, more premium color drift

        float p1 = sin(vPos.x * 0.8 + t);
        float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);

        vec3 activeColor = mix(cAzure, cIndigo, p1 * 0.5 + 0.5);
        activeColor = mix(activeColor, cViolet, p2 * 0.5 + 0.5);

        vec3 finalColor = mix(base, activeColor, smoothstep(0.1, 0.8, vSize));
        // Resting dashes stay quiet; only cursor-active ones bloom to full brand color
        float finalAlpha = alpha * mix(0.28, 0.95, vSize);

        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `,
  });

  // --- Instanced grid (same layout as the reference) ---
  const baseGeo = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = baseGeo.index;
  geometry.attributes.position = baseGeo.attributes.position;
  geometry.attributes.uv = baseGeo.attributes.uv;

  const offsets = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const angles = new Float32Array(count);

  const gridWidth = 40;
  const gridHeight = 22;
  const jitter = 0.25;

  let i = 0;
  for (let y = 0; y < countY; y++) {
    for (let x = 0; x < countX; x++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      let px = (u - 0.5) * gridWidth;
      let py = (v - 0.5) * gridHeight;
      px += (Math.random() - 0.5) * jitter;
      py += (Math.random() - 0.5) * jitter;
      offsets[i * 3] = px;
      offsets[i * 3 + 1] = py;
      offsets[i * 3 + 2] = 0;
      randoms[i] = Math.random();
      angles[i] = Math.random() * Math.PI * 2;
      i++;
    }
  }

  geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("aRandom", new THREE.InstancedBufferAttribute(randoms, 1));
  geometry.setAttribute("aAngleOffset", new THREE.InstancedBufferAttribute(angles, 1));
  geometry.instanceCount = count;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // --- Viewport mapping (mirror R3F's useThree().viewport at z = 0) ---
  let viewW = 1, viewH = 1, rect = canvas.getBoundingClientRect();
  const resize = () => {
    rect = canvas.getBoundingClientRect();
    const cw = canvas.clientWidth || rect.width;
    const ch = canvas.clientHeight || rect.height;
    renderer.setSize(cw, ch, false); // false → keep CSS sizing (h-full w-full)
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    viewH = 2 * Math.tan((FOV * Math.PI) / 180 / 2) * CAM_Z;
    viewW = viewH * camera.aspect;
    uniforms.uResolution.value.set(cw, ch);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", () => { rect = canvas.getBoundingClientRect(); }, { passive: true });

  // --- Pointer → target (NDC mapped into world units, like R3F's pointer) ---
  const target = new THREE.Vector2(0, 0);
  let hovering = false;
  host.addEventListener("pointermove", (e) => {
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    target.set((ndcX * viewW) / 2, (ndcY * viewH) / 2);
    hovering = true;
  }, { passive: true });
  host.addEventListener("pointerleave", () => { hovering = false; target.set(0, 0); });

  // --- Render loop ---
  const clock = new THREE.Clock();
  let raf = 0;
  const render = () => {
    uniforms.uTime.value = clock.getElapsedTime();
    const m = uniforms.uMouse.value;
    const tx = hovering ? target.x : 0;
    const ty = hovering ? target.y : 0;
    m.x += (tx - m.x) * DRAG; // heavy-drag follow
    m.y += (ty - m.y) * DRAG;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(render); };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  if (reduceMotion) {
    renderer.render(scene, camera); // single static frame, no animation
  } else {
    start();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0 }
      ).observe(canvas);
    }
  }
}
