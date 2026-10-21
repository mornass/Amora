"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE_EXPO } from "@/lib/launch";
import { CHAPTER_EVENT } from "@/lib/chapters";
import { Magnetic } from "./Magnetic";

export function Header({ ready }: { ready: boolean }) {
  const [chapter, setChapter] = useState("Nouvelle Eau de Parfum");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Le chapitre courant est publié par la scène 3D
  useEffect(() => {
    const onChapter = (e: Event) => setChapter((e as CustomEvent<string>).detail);
    window.addEventListener(CHAPTER_EVENT, onChapter);
    return () => window.removeEventListener(CHAPTER_EVENT, onChapter);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -40, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.6 }}
    >
      <motion.div className="h-px origin-left bg-cream/70" style={{ scaleX: progress }} />
      <div className="grid grid-cols-[1fr_auto] items-center px-5 py-4 md:grid-cols-3 md:px-10 md:py-6">
        <a href="#top" className="font-serif text-2xl tracking-[0.35em]">
          AMORA
        </a>

        <div className="hidden h-4 justify-self-center overflow-hidden md:block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={chapter}
              className="eyebrow block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_EXPO }}
            >
              {chapter}
            </motion.span>
          </AnimatePresence>
        </div>

        <Magnetic className="justify-self-end">
          <a
            href="#launch"
            className="group flex items-center gap-2 rounded-full border border-cream/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] backdrop-blur-md transition-colors duration-500 hover:border-cream hover:bg-cream hover:text-crimson"
          >
            Être prévenu
            <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
          </a>
        </Magnetic>
      </div>
    </motion.header>
  );
}
