"use client";

import { motion, useScroll, useTransform } from "motion/react";

// Fond fixe : le rouge s'assombrit à mesure que l'on approche de la date de sortie
export function Backdrop() {
  const { scrollYProgress } = useScroll();
  const color = useTransform(scrollYProgress, [0, 0.45, 1], ["#a50f1c", "#8a0b17", "#4a040c"]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.75, 0.5]);

  return (
    <motion.div aria-hidden className="fixed inset-0 -z-10" style={{ backgroundColor: color }}>
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: glow,
          background:
            "radial-gradient(ellipse 45% 55% at 50% 48%, rgb(225 38 47 / 0.85), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 45%, rgb(30 0 4 / 0.55) 100%)",
        }}
      />
    </motion.div>
  );
}
