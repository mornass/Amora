"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Curseur personnalisé : un point précis et un anneau qui le suit avec inertie
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHover(!!(e.target as Element).closest?.("a, button, input, label"));
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-cream/70"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hover ? 72 : 34,
          height: hover ? 72 : 34,
          backgroundColor: hover ? "rgba(247,236,227,0.12)" : "rgba(247,236,227,0)",
          scale: down ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[91] size-1.5 rounded-full bg-cream"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hover ? 0 : 1 }}
      />
    </>
  );
}
