"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE_EXPO } from "@/lib/launch";
import { CHAPTER_EVENT } from "@/lib/chapters";
import { Magnetic } from "./Magnetic";
import { RollText } from "./RollText";

const NAV = [
  { n: "01", label: "Manifeste", href: "#manifesto" },
  { n: "02", label: "Notes", href: "#notes" },
  { n: "03", label: "Flacon", href: "#flacon" },
  { n: "04", label: "Lancement", href: "#launch" },
];

export function Header({ ready }: { ready: boolean }) {
  // Libellé du chapitre courant, publié par la scène 3D (ex. « 02 · Notes de cœur »)
  const [chapter, setChapter] = useState("");
  const active = chapter.slice(0, 2);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

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
      {/* Flou progressif : le contenu qui passe sous le header se fond au lieu de chevaucher le logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150%] bg-gradient-to-b from-black/25 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
      />
      <motion.div className="h-px origin-left bg-cream/70" style={{ scaleX: progress }} />
      <div className="grid grid-cols-[1fr_auto] items-center px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-10 md:py-6">
        <a href="#top" className="group font-serif text-2xl tracking-[0.35em]" aria-label="Amora, haut de page">
          <RollText text="AMORA" />
        </a>

        {/* Sommaire : le chapitre actif déplie son nom */}
        <nav aria-label="Chapitres" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const on = active === item.n;
            return (
              <a
                key={item.n}
                href={item.href}
                aria-current={on ? "true" : undefined}
                className="group relative flex items-center text-[11px] uppercase tracking-[0.3em]"
              >
                <span className={`tabular-nums transition-colors duration-500 ${on ? "text-cream" : "text-cream/45 group-hover:text-cream"}`}>
                  {item.n}
                </span>
                <motion.span
                  className="overflow-hidden whitespace-nowrap"
                  initial={false}
                  animate={{ width: on ? "auto" : 0, opacity: on ? 1 : 0, marginLeft: on ? 10 : 0 }}
                  transition={{ duration: 0.7, ease: EASE_EXPO }}
                >
                  {item.label}
                </motion.span>
                {on && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-2 left-0 h-px w-full bg-gold"
                    transition={{ duration: 0.7, ease: EASE_EXPO }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <Magnetic className="justify-self-end">
          <a
            href="#launch"
            className="group flex items-center gap-2 rounded-full border border-cream/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] backdrop-blur-md transition-colors duration-500 hover:border-cream hover:bg-cream hover:text-crimson"
          >
            <RollText text="Être prévenu" />
            <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
          </a>
        </Magnetic>
      </div>
    </motion.header>
  );
}
