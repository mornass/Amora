"use client";

import { useRef } from "react";
import { motion, transform, useScroll, useTransform, type MotionValue } from "motion/react";

const NOTES = [
  {
    tier: "Notes de tête",
    word: "Éclat",
    ingredients: ["Poivre rose", "Bergamote de Calabre", "Grenade"],
    text: "Une étincelle vive, presque insolente : le premier regard.",
  },
  {
    tier: "Notes de cœur",
    word: "Passion",
    ingredients: ["Rose de Damas", "Jasmin sambac", "Framboise noire"],
    text: "La rose s'ouvre, charnelle et veloutée : le cœur s'emballe.",
  },
  {
    tier: "Notes de fond",
    word: "Empreinte",
    ingredients: ["Ambre", "Vanille bourbon", "Bois de santal", "Musc"],
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

  // Séquentiel, sans chevauchement : la note sortante disparaît avant l'entrée de la suivante.
  // Fonctions JS (et non des plages) : évite l'accélération ScrollTimeline qui ne borne pas hors plage.
  const range = [a, a + 0.06, b - 0.08, b - 0.02];
  const toOpacity = transform(range, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const toY = transform(range, [first ? 0 : 80, 0, 0, last ? 0 : -80]);
  const toClip = transform([a, a + 0.06], [first ? 0 : 100, 0]);
  const opacity = useTransform(progress, (v) => toOpacity(v));
  const y = useTransform(progress, (v) => toY(v));
  const clip = useTransform(progress, (v) => `inset(${toClip(v)}% 0% 0% 0%)`);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-end gap-8 px-5 pb-24 md:flex-row md:items-center md:justify-between md:px-10 md:pb-0"
      style={{ opacity, visibility }}
    >
      <motion.div style={{ y }} className="md:w-[34%]">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">{note.tier}</p>
        <motion.h3 style={{ clipPath: clip }} className="font-serif text-6xl leading-[0.9] md:text-[7.5vw]">
          {note.word}
        </motion.h3>
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/75">{note.text}</p>
      </motion.div>

      <motion.ul style={{ y }} className="flex flex-wrap gap-2 md:w-[26%] md:flex-col md:items-end md:gap-3">
        {note.ingredients.map((ing) => (
          <li
            key={ing}
            className="rounded-full border border-cream/30 px-4 py-1.5 font-serif text-lg italic md:text-2xl"
          >
            {ing}
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

function Dot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const step = 1 / NOTES.length;
  const scaleX = useTransform(progress, [index * step, (index + 1) * step], [0, 1]);
  return (
    <span className="h-px w-12 overflow-hidden bg-cream/25">
      <motion.span className="block h-full origin-left bg-cream" style={{ scaleX }} />
    </span>
  );
}

export function Notes() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const counter = useTransform(scrollYProgress, (p) =>
    `0${Math.min(NOTES.length, Math.floor(p * NOTES.length) + 1)}`
  );

  return (
    <section ref={ref} data-bottle="center" className="relative z-10 h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-x-5 top-24 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-cream/70 md:inset-x-10 md:top-28">
          <span>La pyramide olfactive</span>
          <span className="font-serif text-2xl normal-case tracking-normal text-cream">
            <motion.span>{counter}</motion.span>
            <span className="text-cream/40"> / 0{NOTES.length}</span>
          </span>
        </div>

        {NOTES.map((note, i) => (
          <Note key={note.word} note={note} index={i} progress={scrollYProgress} />
        ))}

        <div className="absolute inset-x-0 bottom-10 flex justify-center gap-3">
          {NOTES.map((_, i) => (
            <Dot key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
