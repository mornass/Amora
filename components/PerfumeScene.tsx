"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useScroll, useSpring, useVelocity } from "motion/react";
import { CHAPTER_EVENT, POSES, measureChapters, sampleChapters, toTriplet } from "@/lib/chapters";
import { sceneState } from "@/lib/sceneState";

// Nombre de tours complets du flacon sur toute la page
const TURNS = 2;

type Props = {
  onProgress: (value: number) => void;
  ready: boolean;
};

// Texture ronde et douce pour les particules
function sparkTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,236,200,0.75)");
  grad.addColorStop(1, "rgba(255,220,170,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function PerfumeScene({ onProgress, ready }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Le scroll pilote la rotation (Lenis lisse déjà le défilement, le ressort arrondit le reste)
  const { scrollYProgress, scrollY } = useScroll();
  const rotation = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Neutral : conserve la saturation des rouges (ACES les délave vers le rose)
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    // Matrice monde à jour dès le départ : project() est appelé avant le premier rendu
    camera.updateMatrixWorld();

    const key = new THREE.DirectionalLight(0xfff0e0, 2.2);
    key.position.set(3, 5, 6);
    const rim = new THREE.PointLight(0xff2a2a, 50, 14);
    rim.position.set(-3.5, 1.5, -2.5);
    const warm = new THREE.PointLight(0xe8c08a, 16, 12);
    warm.position.set(3, -2.5, 3);
    scene.add(key, rim, warm);

    // pivot : position/échelle par chapitre — inner : rotation pilotée par le scroll
    const pivot = new THREE.Group();
    const inner = new THREE.Group();
    pivot.add(inner);
    scene.add(pivot);

    // Verre : uniquement ses reflets, ajoutés à l'image sans toucher l'alpha.
    // Un verre réel ne diffuse presque pas de lumière : un voile blanc rosissait le jus.
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const liquid = new THREE.MeshPhysicalMaterial({
      color: 0x8a0714,
      roughness: 0.04,
      clearcoat: 0.5,
      clearcoatRoughness: 0.02,
      specularIntensity: 0.5,
      envMapIntensity: 0.3,
    });
    // Bords plus sombres, cœur lumineux : l'épaisseur du jus se lit comme un volume
    liquid.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        "outgoingLight *= mix(1.0, 0.22, pow(1.0 - saturate(dot(normal, geometryViewDir)), 1.5));\n#include <opaque_fragment>"
      );
    };
    const cap = new THREE.MeshStandardMaterial({
      color: 0xe2bd85,
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });

    /* ----- Particules dorées en suspension autour du flacon ----- */
    const COUNT = 420;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 1.6 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = Math.sin(theta) * r - 1;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const base = positions.slice();
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const sparkTex = sparkTexture();
    const sparkMat = new THREE.PointsMaterial({
      map: sparkTex,
      color: 0xf2cf98,
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    pivot.add(sparks);

    let model: THREE.Object3D | null = null;
    new GLTFLoader().load(
      "/models/parfum.glb",
      (gltf) => {
        model = gltf.scene;
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const name = obj.name.toLowerCase();
          if (name.startsWith("liquid")) {
            obj.material = liquid;
            obj.renderOrder = 1;
          } else if (name.startsWith("circle")) {
            obj.material = cap;
          } else {
            obj.material = glass;
            obj.renderOrder = 2;
          }
        });

        // Centre et normalise : le flacon fait 2.8 unités de haut
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));
        const wrapper = new THREE.Group();
        wrapper.add(model);
        wrapper.scale.setScalar(2.8 / size.y);
        inner.add(wrapper);
        onProgressRef.current(100);
      },
      (e) => {
        if (e.total) onProgressRef.current(Math.min(99, (e.loaded / e.total) * 100));
      },
      (err) => {
        console.error("Amora : impossible de charger le flacon", err);
        onProgressRef.current(100);
      }
    );

    /* ----- Mesures ----- */
    let anchors = measureChapters();
    let view = { w: 1, h: 1 };
    let viewport = { w: 1, h: 1 };
    let mobile = false;

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mobile = w < 768;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      view = { w: halfH * camera.aspect, h: halfH };
      viewport = { w, h };
      anchors = measureChapters();
    };

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onPointer);

    const current = { ...POSES.hero.desktop };
    const liquidColor = new THREE.Color();
    const glowColor = new THREE.Color();
    const projected = new THREE.Vector3();
    // Repères du flacon pour les annotations : bouchon et jus suivent la rotation, le verre reste sur le bord
    const marks: { point: THREE.Vector3; space: THREE.Object3D }[] = [
      { point: new THREE.Vector3(0, 1.05, 0), space: inner },
      { point: new THREE.Vector3(0.46, -0.05, 0), space: pivot },
      { point: new THREE.Vector3(0, -0.5, 0), space: inner },
    ];
    let lastBg = "";
    let label = "";
    let intro = 0;
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;

    const tick = (now: number) => {
      timer.update(now);
      const t = reduced ? 0 : timer.getElapsed();
      const k = reduced ? 1 : 0.085;

      const chapter = sampleChapters(anchors, window.scrollY, mobile);
      if (chapter) {
        current.x += (chapter.pose.x - current.x) * k;
        current.y += (chapter.pose.y - current.y) * k;
        current.s += (chapter.pose.s - current.s) * k;

        // Couleurs du chapitre : fond en soie (via l'état partagé), jus et lumière de contour (3D)
        sceneState.bg = chapter.bg;
        sceneState.glow = chapter.glow;
        const bg = toTriplet(chapter.bg);
        if (bg !== lastBg) {
          // Fond de la page sous le canvas (rebonds de scroll) : écrit seulement s'il change
          root.style.setProperty("--bg", bg);
          lastBg = bg;
        }
        liquidColor.setRGB(chapter.liquid[0] / 255, chapter.liquid[1] / 255, chapter.liquid[2] / 255, THREE.SRGBColorSpace);
        liquid.color.lerp(liquidColor, 0.12);
        liquid.emissive.copy(liquid.color).multiplyScalar(0.14);
        glowColor.setRGB(chapter.glow[0] / 255, chapter.glow[1] / 255, chapter.glow[2] / 255, THREE.SRGBColorSpace);
        rim.color.lerp(glowColor, 0.1);

        if (chapter.label !== label) {
          label = chapter.label;
          window.dispatchEvent(new CustomEvent(CHAPTER_EVENT, { detail: label }));
        }
      }

      // Entrée du flacon une fois le preloader terminé
      intro += ((readyRef.current ? 1 : 0) - intro) * (reduced ? 1 : 0.03);
      const introEase = 1 - Math.pow(1 - intro, 3);

      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      pivot.position.set(current.x * view.w, current.y * view.h - (1 - introEase) * 2.4, 0);
      pivot.scale.setScalar(current.s * (0.55 + introEase * 0.45));

      const v = velocity.get();
      const tilt = Number.isFinite(v) ? THREE.MathUtils.clamp(v / 3500, -1, 1) : 0;
      inner.rotation.y =
        rotation.get() * Math.PI * 2 * TURNS - (1 - introEase) * Math.PI * 1.4 + pointer.sx * 0.3;
      inner.rotation.x = pointer.sy * 0.12 + tilt * 0.16;
      inner.rotation.z = Math.sin(t * 0.7) * 0.035 - tilt * 0.1;
      inner.position.y = Math.sin(t * 1.1) * 0.07;

      // Particules : dérive lente, secouées par la vitesse de scroll
      sparks.rotation.y = t * 0.04 + rotation.get() * Math.PI * 0.8;
      sparkMat.opacity = 0.85 * introEase;
      for (let i = 0; i < COUNT; i++) {
        const s = seeds[i];
        positions[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.4 + s) * 0.18 - tilt * 0.6 * Math.sin(s);
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // Position du flacon à l'écran : halo du fond et annotations
      sceneState.velocity = tilt;
      projected.copy(pivot.position).project(camera);
      sceneState.glowPos = [(projected.x + 1) / 2, (projected.y + 1) / 2];
      pivot.updateMatrixWorld(true);
      marks.forEach((m, i) => {
        projected.copy(m.point);
        m.space.localToWorld(projected).project(camera);
        sceneState.points[i] = [((projected.x + 1) / 2) * viewport.w, ((1 - projected.y) / 2) * viewport.h];
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timer.dispose();
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      [glass, liquid, cap, sparkMat].forEach((m) => m.dispose());
      sparkGeo.dispose();
      sparkTex.dispose();
      model?.traverse((obj) => obj instanceof THREE.Mesh && obj.geometry.dispose());
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [rotation, velocity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] h-screen w-screen"
    />
  );
}
