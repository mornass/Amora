"use client";

import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { tone } from "@/lib/chapters";
import { EASE_EXPO } from "@/lib/launch";
import { RollText } from "./RollText";

const LINKS = [
  { label: "Manifeste", href: "#manifesto" },
  { label: "Notes", href: "#notes" },
  { label: "Le flacon", href: "#flacon" },
  { label: "Lancement", href: "#launch" },
];

// Pas de z-index sur le footer : le grand « AMORA » (z-0) passe sous le flacon, comme dans le hero
export function Footer() {
  return (
    <footer
      data-chapter="04 · Lancement"
      data-bottle="outro"
      {...tone("outro")}
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pt-28 md:px-10"
    >
      <div className="relative z-10 grid grid-cols-2 gap-8 text-sm md:grid-cols-[1fr_auto_1fr]">
        <div>
          <p className="eyebrow mb-4">Maison Amora</p>
          <ul className="space-y-1.5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group inline-flex text-cream/80 hover:text-cream">
                  <RollText text={l.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:block" />

        <div className="text-right">
          <p className="eyebrow mb-4">Lancement</p>
          <p className="font-serif text-3xl leading-none">21.12.2026</p>
          <p className="mt-2 text-cream/60">Paris · en ligne et en boutique</p>
        </div>
      </div>

      <div>
        <motion.p
          aria-hidden
          className="relative z-0 select-none text-center font-serif text-[30vw] leading-[0.74] tracking-[-0.02em]"
          initial={{ y: "30%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.6, ease: EASE_EXPO }}
        >
          AMORA
        </motion.p>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-cream/15 py-5 text-[11px] text-cream/55">
          <span>© 2026 Maison Amora — Paris</span>
          <span>
            Modèle 3D « Parfum Bottle » par{" "}
            <a
              href="https://sketchfab.com/ANDRIANIAINAToky"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-cream"
            >
              AT design studio
            </a>
          </span>
          <a href="#top" className="group flex items-center gap-2 uppercase tracking-[0.3em] hover:text-cream">
            <RollText text="Haut de page" />
            <ArrowUp className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
