"use client";

import { createElement, useRef } from "react";
import { motion, useInView } from "motion/react";
import { EASE_EXPO } from "@/lib/launch";

type Props = {
  // Les passages entre *astérisques* sont mis en italique doré
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  play?: boolean; // force le déclenchement (ex. après le preloader)
};

// Titre révélé mot par mot, chaque mot remonte depuis un masque
export function Reveal({ text, as = "h2", className, delay = 0, play }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const visible = play ?? inView;

  let italic = false;
  const words = text.split(" ").map((raw) => {
    const starts = raw.startsWith("*");
    const ends = raw.endsWith("*");
    if (starts) italic = true;
    const word = { text: raw.replace(/\*/g, ""), italic };
    if (ends) italic = false;
    return word;
  });

  return createElement(
    as,
    { ref, className, "aria-label": text.replace(/\*/g, "") },
    words.map((w, i) => (
      <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
        <motion.span
          className={`inline-block ${w.italic ? "italic text-gold" : ""}`}
          initial={{ y: "115%", rotate: 4 }}
          animate={visible ? { y: "0%", rotate: 0 } : {}}
          transition={{ duration: 1.2, ease: EASE_EXPO, delay: delay + i * 0.045 }}
        >
          {w.text}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      </span>
    ))
  );
}

// Bloc qui apparaît en fondu ascendant à l'entrée dans l'écran
export function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease: EASE_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
