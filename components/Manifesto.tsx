"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const TEXT =
  "Amora n'est pas un parfum que l'on porte. C'est une déclaration. Une rose sombre, un éclat de poivre, une peau qui se souvient longtemps après le départ.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span className="mr-[0.25em] inline-block" style={{ opacity, y }}>
      {word}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");

  return (
    <section
      id="manifesto"
      data-bottle="right"
      className="relative z-10 flex min-h-svh items-center px-5 py-32 md:px-10"
    >
      <div className="md:w-[62%]">
        <p className="mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-cream/70">
          <span className="h-px w-10 bg-cream/50" /> Manifeste
        </p>
        <p ref={ref} className="font-serif text-[2.6rem] leading-[1.05] md:text-[5.2vw]">
          {words.map((w, i) => (
            <Word
              key={i}
              word={w}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
            />
          ))}
        </p>
      </div>
    </section>
  );
}
