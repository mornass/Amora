"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useScroll, useSpring, useVelocity } from "motion/react";

type Pose = { x: number; y: number; s: number };

// x / y : fraction de la demi-largeur / demi-hauteur visible — s : échelle
const POSES: Record<string, { desktop: Pose; mobile: Pose }> = {
  hero: { desktop: { x: 0, y: -0.06, s: 1 }, mobile: { x: 0, y: 0.02, s: 0.82 } },
  right: { desktop: { x: 0.46, y: 0, s: 0.95 }, mobile: { x: 0.5, y: 0.6, s: 0.32 } },
  center: { desktop: { x: 0, y: 0, s: 1.1 }, mobile: { x: 0, y: 0.3, s: 0.66 } },
  left: { desktop: { x: -0.48, y: 0, s: 0.95 }, mobile: { x: 0, y: 0.5, s: 0.46 } },
  outro: { desktop: { x: -0.5, y: 0.04, s: 0.82 }, mobile: { x: 0.68, y: -0.62, s: 0.32 } },
};

// Nombre de tours complets du flacon sur toute la page
const TURNS = 2;

type Props = {
  onProgress: (value: number) => void;
  ready: boolean;
};

export function PerfumeScene({ onProgress, ready }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Le scroll pilote la rotation : progression lissée par un ressort
  const { scrollYProgress, scrollY } = useScroll();
  const rotation = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const key = new THREE.DirectionalLight(0xffe4cc, 2.4);
    key.position.set(3, 5, 6);
    const rim = new THREE.PointLight(0xff2a2a, 45, 14);
    rim.position.set(-3.5, 1.5, -2.5);
    const warm = new THREE.PointLight(0xe6c08a, 18, 12);
    warm.position.set(3, -2.5, 3);
    scene.add(key, rim, warm);

    // pivot : position/échelle selon la section — inner : rotation pilotée par le scroll
    const pivot = new THREE.Group();
    const inner = new THREE.Group();
    pivot.add(inner);
    scene.add(pivot);

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffe9e4,
      roughness: 0.03,
      transparent: true,
      opacity: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const liquid = new THREE.MeshPhysicalMaterial({
      color: 0x7a0410,
      emissive: 0x3a0006,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.1,
    });
    const cap = new THREE.MeshStandardMaterial({
      color: 0xe6c08a,
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1.8,
    });

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

    /* ----- Ancrages : une pose par section [data-bottle] ----- */
    let anchors: { at: number; pose: string }[] = [];
    let view = { w: 1, h: 1 };
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

      anchors = [];
      document.querySelectorAll<HTMLElement>("[data-bottle]").forEach((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const pose = el.dataset.bottle!;
        // Les sections « sticky » gardent la pose pendant toute leur durée
        if (el.offsetHeight > h * 1.4) {
          anchors.push({ at: top, pose }, { at: top + el.offsetHeight - h, pose });
        } else {
          anchors.push({ at: top + el.offsetHeight / 2 - h / 2, pose });
        }
      });
      // Bornés à la plage réellement scrollable : la dernière pose est atteinte en bas de page
      const max = document.documentElement.scrollHeight - h;
      anchors.forEach((a) => (a.at = Math.min(Math.max(a.at, 0), max)));
    };

    const ease = (t: number) => t * t * (3 - 2 * t);
    const poseAt = (scroll: number): Pose => {
      const get = (name: string) => (mobile ? POSES[name].mobile : POSES[name].desktop);
      if (!anchors.length) return get("hero");
      if (scroll <= anchors[0].at) return get(anchors[0].pose);
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (scroll <= b.at) {
          const t = b.at === a.at ? 1 : ease((scroll - a.at) / (b.at - a.at));
          const pa = get(a.pose);
          const pb = get(b.pose);
          return {
            x: pa.x + (pb.x - pa.x) * t,
            y: pa.y + (pb.y - pa.y) * t,
            s: pa.s + (pb.s - pa.s) * t,
          };
        }
      }
      return get(anchors[anchors.length - 1].pose);
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
    let intro = 0;
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;

    const tick = (now: number) => {
      timer.update(now);
      const t = reduced ? 0 : timer.getElapsed();
      const k = reduced ? 1 : 0.075;
      const target = poseAt(window.scrollY);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      current.s += (target.s - current.s) * k;

      // Entrée du flacon une fois le preloader terminé
      intro += ((readyRef.current ? 1 : 0) - intro) * (reduced ? 1 : 0.035);
      const introEase = 1 - Math.pow(1 - intro, 3);

      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      pivot.position.set(
        current.x * view.w,
        current.y * view.h - (1 - introEase) * 2.2,
        0
      );
      pivot.scale.setScalar(current.s * (0.6 + introEase * 0.4));

      const tilt = THREE.MathUtils.clamp(velocity.get() / 3500, -1, 1);
      inner.rotation.y =
        rotation.get() * Math.PI * 2 * TURNS - (1 - introEase) * Math.PI * 1.2 + pointer.sx * 0.3;
      inner.rotation.x = pointer.sy * 0.12 + tilt * 0.18;
      inner.rotation.z = Math.sin(t * 0.7) * 0.035 - tilt * 0.12;
      inner.position.y = Math.sin(t * 1.1) * 0.07;

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
      [glass, liquid, cap].forEach((m) => m.dispose());
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
