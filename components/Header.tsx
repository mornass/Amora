"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE_EXPO } from "@/lib/launch";

export function Header({ ready }: { ready: boolean }) {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10 md:py-7"
      initial={{ y: -40, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.6 }}
    >
      <a href="#top" className="font-serif text-2xl tracking-[0.35em]">
        AMORA
      </a>
      <span className="hidden text-[11px] uppercase tracking-[0.3em] text-cream/70 md:block">
        Nouvelle Eau de Parfum
      </span>
      <a
        href="#launch"
        className="group flex items-center gap-2 rounded-full border border-cream/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] backdrop-blur-sm transition-colors hover:bg-cream hover:text-crimson"
      >
        Être prévenu
        <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
      </a>
    </motion.header>
  );
}
