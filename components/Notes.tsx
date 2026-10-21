"use client";

import { useRef } from "react";
import { motion, transform, useScroll, useTransform, type MotionValue } from "motion/react";
import { tone } from "@/lib/chapters";

const NOTES = [
  {
    tone: "top" as const,
    tier: "Notes de tête",
    word: "Éclat",
    ingredients: ["Poivre rose", "Bergamote de Calabre", "Grenade"],
    text: "Une étincelle vive, presque insolente : le premier regard.",
  },
  {
    tone: "heart" as const,
    tier: "Notes de cœur",
    word: "Passion",
    ingredients: ["Rose de Damas", "Jasmin sambac", "Framboise noire"],
    text: "La rose s'ouvre, charnelle et veloutée : le cœur s'emballe.",
  },
  {
    tone: "base" as const,
    tier: "Notes de fond",
    word: "Empreinte",
    ingredients: ["Ambre", "Vanille bourbon", "Bois de santal", "Musc blanc"],
    text: "Un sillage chaud qui reste sur la peau : le souvenir.",
  },
];

function Note({
  note,
  index,
  progress,
}: {
  note: (typeof NOTES)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const step = 1 / NOTES.length;
  const a = index * step;
  const b = a + step;
  const first = index === 0;
  const last = index === NOTES.length - 1;

  // Séquentiel, sans chevauchement. Fonctions JS : évite l'accélération ScrollTimeline non bornée
  const range = [a, a + 0.06, b - 0.08, b - 0.02];
  const toOpacity = transform(range, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const toY = transform(range, [first ? 0 : 60, 0, 0, last ? 0 : -60]);
  const toClip = transform([a, a + 0.07], [first ? 0 : 100, 0]);
  const toNum = transform([a, b], [40, -40]);
  const opacity = useTransform(progress, (v) => toOpacity(v));
  const y = useTransform(progress, (v) => toY(v));
  const clip = useTransform(progress, (v) => `inset(${toClip(v)}% 0% 0% 0%)`);
  const numY = useTransform(progress, (v) => `${toNum(v)}%`);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div className="absolute inset-0" style={{ opacity, visibility }}>
      {/* Grand numéro en contour, en fond */}
      <motion.span
        aria-hidden
        className="text-outline pointer-events-none absolute -left-[2vw] bottom-[-6vw] font-serif text-[44vw] leading-none md:bottom-[-8vw] md:text-[34vw]"
        style={{ y: numY }}
      >
        0{index + 1}
      </motion.span>

      <div className="relative flex h-full flex-col justify-end gap-8 px-5 pb-24 md:flex-row md:items-center md:justify-between md:px-10 md:pb-0">
        <motion.div style={{ y }} className="md:w-[34%]">
          <p className="eyebrow mb-4 text-gold!">{note.tier}</p>
          <motion.h3 style={{ clipPath: clip }} className="font-serif text-6xl leading-[0.9] md:text-[7.5vw]">
            {note.word}
          </motion.h3>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/75">{note.text}</p>
        </motion.div>

        <motion.ul style={{ y }} className="md:w-[28%]">
          {note.ingredients.map((ing, i) => (
            <li
              key={ing}
              className="flex items-baseline justify-between gap-4 border-b border-cream/20 py-2.5 first:border-t md:py-3.5"
            >
              <span className="font-serif text-xl italic md:text-3xl">{ing}</span>
              <span className="text-[10px] tracking-[0.2em] text-cream/50">{String.fromCharCode(97 + i)}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}

function Bar({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const step = 1 / NOTES.length;
  const toScale = transform([index * step, (index + 1) * step], [0, 1]);
  const scaleX = useTransform(progress, (v) => toScale(v));
  return (
    <span className="h-px w-14 overflow-hidden bg-cream/25">
      <motion.span className="block h-full origin-left bg-cream" style={{ scaleX }} />
    </span>
  );
}

export function Notes() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="notes" ref={ref} className="relative z-10 h-[360vh]">
      {/* Repères de chapitre : un par note, pour la couleur de fond et la teinte du jus */}
      {NOTES.map((note, i) => (
        <div
          key={note.tone}
          aria-hidden
          data-chapter={`02 · ${note.tier}`}
          data-bottle="center"
          {...tone(note.tone)}
          className="pointer-events-none absolute inset-x-0"
          style={{ top: `${(i * 100) / NOTES.length}%`, height: `${100 / NOTES.length}%` }}
        />
      ))}

      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-x-5 top-20 z-10 flex items-center gap-4 md:inset-x-10 md:top-24">
          <span className="font-serif text-xl italic text-gold">02</span>
          <span className="h-px w-12 bg-cream/40" />
          <span className="eyebrow">La pyramide olfactive</span>
        </div>

        {NOTES.map((note, i) => (
          <Note key={note.word} note={note} index={i} progress={scrollYProgress} />
        ))}

        <div className="absolute inset-x-0 bottom-10 flex justify-center gap-3">
          {NOTES.map((note, i) => (
            <Bar key={note.tone} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
