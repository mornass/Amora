"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { EASE_EXPO, LAUNCH_LABEL } from "@/lib/launch";
import { tone } from "@/lib/chapters";
import { Reveal } from "./Reveal";

const TITLE = "AMORA".split("");

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const titleBlur = useTransform(scrollYProgress, (v) => `blur(${v * 14}px)`);
  const fade = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v * 4));

  // Légère parallaxe du titre géant à la souris
  const mx = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const move = (e: PointerEvent) => mx.set((e.clientX / window.innerWidth - 0.5) * -30);
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [mx]);

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.2, ease: EASE_EXPO, delay },
  });

  return (
    <section
      id="top"
      ref={ref}
      data-chapter="Nouvelle Eau de Parfum"
      data-bottle="hero"
      {...tone("hero")}
      className="relative flex h-svh min-h-[600px] flex-col justify-end px-5 pb-8 md:px-10 md:pb-10"
    >
      {/* Titre géant derrière le flacon (z-0 < canvas z-5) */}
      <motion.h1
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center font-serif text-[31vw] leading-[0.8] tracking-[-0.02em] md:text-[26vw]"
        style={{ y: titleY, scale: titleScale, x: px, filter: titleBlur }}
      >
        <span className="sr-only">Amora</span>
        {TITLE.map((letter, i) => (
          <span key={i} aria-hidden className="inline-block overflow-hidden py-[0.06em]">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", filter: "blur(12px)" }}
              animate={ready ? { y: "0%", filter: "blur(0px)" } : {}}
              transition={{ duration: 1.8, ease: EASE_EXPO, delay: 0.1 + i * 0.09 }}
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
        <div className="max-w-xs">
          <motion.p {...show(0.8)} className="eyebrow mb-3">
            Eau de Parfum · 100 ml
          </motion.p>
          <Reveal
            as="p"
            play={ready}
            delay={0.9}
            text="Le nouveau parfum. *Une déclaration rouge.*"
            className="font-serif text-2xl leading-tight md:text-3xl"
          />
        </div>

        <motion.a
          {...show(1.1)}
          href="#manifesto"
          className="group hidden items-center justify-center gap-3 justify-self-center md:flex"
        >
          <span className="grid size-11 place-items-center rounded-full border border-cream/40 transition-colors duration-500 group-hover:bg-cream group-hover:text-crimson">
            <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ArrowDown className="size-4" />
            </motion.span>
          </span>
          <span className="eyebrow">Découvrir</span>
        </motion.a>

        <motion.div {...show(1.2)} className="md:text-right">
          <p className="eyebrow">Disponible le</p>
          <p className="font-serif text-4xl tabular-nums md:text-5xl">{LAUNCH_LABEL}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
