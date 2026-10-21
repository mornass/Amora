"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { EASE_EXPO, LAUNCH_LABEL } from "@/lib/launch";

const MIN_DURATION = 2800; // ms : laisse le temps à l'animation de respirer
const LETTERS = "AMORA".split("");

type Props = {
  progress: number; // progression réelle du chargement du flacon (0–100)
  onComplete: () => void;
};

export function Preloader({ progress, onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Compteur lissé : ne dépasse jamais ni le chargement réel ni le temps minimum
  useEffect(() => {
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const loop = (now: number) => {
      const timeCap = Math.min(1, (now - start) / MIN_DURATION) * 100;
      const target = Math.min(progressRef.current, timeCap);
      shown += (target - shown) * 0.09;
      if (target >= 100 && shown > 99.4) shown = 100;
      setCount(Math.floor(shown));
      if (shown < 100) raf = requestAnimationFrame(loop);
      else timeout = setTimeout(() => setDone(true), 450);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100]"
          exit={{ pointerEvents: "none" }}
          transition={{ duration: 1.4 }}
        >
          {/* Rideau arrière plus clair : crée la profondeur pendant la sortie */}
          <motion.div
            className="absolute inset-0 bg-rouge"
            initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 1.3, ease: EASE_EXPO, delay: 0.2 }}
          />

          <motion.div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-ink p-5 text-cream md:p-10"
            initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 1.1, ease: EASE_EXPO }}
          >
            <div className="flex items-start justify-between text-[11px] uppercase tracking-[0.3em] text-cream/70">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Maison Amora
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Paris — {LAUNCH_LABEL}
              </motion.span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="size-36 md:size-44"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -40 }}
                transition={{ duration: 1, ease: EASE_EXPO }}
              >
                <DotLottieReact src="/lottie/amora-loader.json" autoplay loop />
              </motion.div>
              <div className="flex overflow-hidden font-serif text-5xl tracking-[0.35em] md:text-7xl">
                {LETTERS.map((l, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-110%" }}
                    transition={{ duration: 1, ease: EASE_EXPO, delay: 0.35 + i * 0.07 }}
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className="font-serif text-lg italic text-cream/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.9, duration: 1 }}
              >
                Une déclaration se prépare…
              </motion.p>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <span className="max-w-[12rem] text-[11px] uppercase leading-relaxed tracking-[0.3em] text-cream/60">
                  Chargement de l&apos;expérience
                </span>
                <span className="font-serif text-[22vw] leading-[0.75] tabular-nums md:text-[11vw]">
                  {String(count).padStart(3, "0")}
                </span>
              </div>
              <div className="mt-5 h-px w-full bg-cream/15">
                <div
                  className="h-full origin-left bg-cream"
                  style={{ transform: `scaleX(${count / 100})` }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
