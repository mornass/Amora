"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Satin rouge : plis larges déformés par un champ lent, éclairés comme un tissu.
// Les couleurs restent en sRGB de bout en bout pour correspondre exactement au CSS.
const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec3 uGlow;
  uniform vec2 uGlowPos;
  uniform float uVel;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = ROT * p; a *= 0.5; }
    return v;
  }
  float fbm3(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p = ROT * p; a *= 0.5; }
    return v;
  }
  float silk(vec2 p, vec2 w, float t) {
    return fbm3(p * 0.5 + 1.6 * w + vec2(t * 0.4, -t * 0.25));
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;
    p = mat2(0.8776, -0.4794, 0.4794, 0.8776) * p * vec2(0.55, 1.2);
    float t = uTime * 0.05;

    // Champ de déformation lent ; la vitesse de scroll fait onduler le tissu
    vec2 w = vec2(fbm(p * 0.45 + vec2(0.0, t)), fbm(p * 0.45 + vec2(5.2, 1.3) - t));
    w += uVel * 0.25;

    float e = 0.02;
    float h = silk(p, w, t);
    float hx = silk(p + vec2(e, 0.0), w, t);
    float hy = silk(p + vec2(0.0, e), w, t);
    vec3 n = normalize(vec3((h - hx) / e, (h - hy) / e, 0.75));

    vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
    float diff = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
    float spec = pow(clamp(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 24.0);

    vec3 col = mix(uBg * 0.32, uBg * 1.08, smoothstep(0.15, 0.95, diff));
    col += mix(uGlow, vec3(1.0, 0.85, 0.75), 0.25) * spec * 0.38;

    // Halo derrière le flacon
    vec2 gp = (vUv - uGlowPos) * vec2(aspect, 1.0);
    float g = exp(-dot(gp, gp) * 4.0);
    col = mix(col, uGlow * (0.75 + 0.25 * diff), g * 0.6);

    // Vignettage
    float vig = smoothstep(1.35, 0.25, length((vUv - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.5, 1.0, vig);

    // Tramage : supprime les bandes dans les dégradés sombres
    col += (hash(vUv * uRes + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const toVec = (c: number[], out: THREE.Vector3) => out.set(c[0] / 255, c[1] / 255, c[2] / 255);

// Fond fixe en WebGL : satin dont les couleurs suivent les chapitres
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uBg: { value: new THREE.Vector3() },
      uGlow: { value: new THREE.Vector3() },
      uGlowPos: { value: new THREE.Vector2(0.5, 0.5) },
      uVel: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms, depthTest: false });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // Le satin est flou par nature : demi-résolution, invisible à l'œil et bien plus léger
    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * 0.5);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      uniforms.uRes.value.copy(size);
    };
    resize();
    window.addEventListener("resize", resize);

    const glowTarget = new THREE.Vector2();
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;

    const tick = (now: number) => {
      timer.update(now);
      uniforms.uTime.value = reduced ? 0 : timer.getElapsed();
      toVec(sceneState.bg, uniforms.uBg.value);
      toVec(sceneState.glow, uniforms.uGlow.value);
      // Une valeur non finie resterait figée dans le lissage : on l'ignore
      glowTarget.fromArray(sceneState.glowPos);
      if (Number.isFinite(glowTarget.x) && Number.isFinite(glowTarget.y)) uniforms.uGlowPos.value.lerp(glowTarget, 0.2);
      if (Number.isFinite(sceneState.velocity)) uniforms.uVel.value += (sceneState.velocity - uniforms.uVel.value) * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timer.dispose();
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen" />;
}
