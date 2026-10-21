"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { tone } from "@/lib/chapters";
import { FadeUp } from "./Reveal";

const TEXT =
  "Amora n'est pas un parfum que l'on porte. C'est une déclaration. Une rose sombre, un éclat de poivre, une peau qui se souvient longtemps après le départ.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  // Fonctions JS (et non des plages) : pas d'accélération ScrollTimeline, rendu identique partout
  const opacity = useTransform(progress, (v) => 0.12 + 0.88 * Math.min(1, Math.max(0, (v - range[0]) / (range[1] - range[0]))));
  // Flou retiré dès que le mot est net : pas de calque filtré inutile pendant le scroll
  const blur = useTransform(opacity, (o) => (o > 0.99 ? "none" : `blur(${(1 - o) * 4}px)`));
  return (
    <motion.span className="mr-[0.25em] inline-block" style={{ opacity, filter: blur }}>
      {word}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = TEXT.split(" ");

  return (
    <section
      id="manifesto"
      data-chapter="01 · Manifeste"
      data-bottle="right"
      {...tone("manifesto")}
      className="relative z-10 flex min-h-svh items-center px-5 py-32 md:px-10"
    >
      <div className="md:w-[60%]">
        <FadeUp className="mb-12 flex items-center gap-4">
          <span className="font-serif text-xl italic text-gold">01</span>
          <span className="h-px w-12 bg-cream/40" />
          <span className="eyebrow">Manifeste</span>
        </FadeUp>
        <p ref={ref} className="font-serif text-[2.6rem] leading-[1.05] md:text-[4.8vw]">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>
        <FadeUp className="mt-12 flex items-center gap-4 text-sm text-cream/60" delay={0.2}>
          <span className="h-px w-8 bg-gold" /> Maison Amora, Paris
        </FadeUp>
      </div>
    </section>
  );
}
