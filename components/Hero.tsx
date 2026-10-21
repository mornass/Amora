"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { EASE_EXPO, LAUNCH_LABEL } from "@/lib/launch";

const TITLE = "AMORA".split("");

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const fade = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v * 4));

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.2, ease: EASE_EXPO, delay },
  });

  return (
    <section
      id="top"
      ref={ref}
      data-bottle="hero"
      className="relative flex h-svh min-h-[600px] flex-col justify-end px-5 pb-8 md:px-10 md:pb-10"
    >
      {/* Titre géant derrière le flacon (z-0 < canvas z-5) */}
      <motion.h1
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center font-serif leading-[0.8] tracking-[-0.02em] text-[31vw] md:text-[26vw]"
        style={{ y: titleY, scale: titleScale }}
      >
        <span className="sr-only">Amora</span>
        {TITLE.map((letter, i) => (
          <span key={i} aria-hidden className="inline-block overflow-hidden py-[0.06em]">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={ready ? { y: "0%" } : {}}
              transition={{ duration: 1.6, ease: EASE_EXPO, delay: 0.15 + i * 0.08 }}
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <motion.div
        className="relative z-10 grid gap-6 md:grid-cols-3 md:items-end"
        style={{ opacity: fade }}
      >
        <motion.p {...show(0.9)} className="max-w-xs font-serif text-2xl leading-tight md:text-3xl">
          Le nouveau parfum. <em className="text-gold">Une déclaration rouge.</em>
        </motion.p>

        <motion.a
          {...show(1.05)}
          href="#manifesto"
          className="hidden items-center justify-center gap-3 justify-self-center text-[11px] uppercase tracking-[0.3em] text-cream/80 md:flex"
        >
          <span className="grid size-10 place-items-center rounded-full border border-cream/40">
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowDown className="size-4" />
            </motion.span>
          </span>
          Faites défiler
        </motion.a>

        <motion.div {...show(1.2)} className="md:text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cream/70">Disponible le</p>
          <p className="font-serif text-4xl md:text-5xl">{LAUNCH_LABEL}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
