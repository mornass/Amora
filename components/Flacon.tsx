"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "motion/react";
import { tone } from "@/lib/chapters";
import { sceneState } from "@/lib/sceneState";
import { Reveal } from "./Reveal";

// Dans l'ordre des repères calculés par la scène : bouchon, verre, jus
const PARTS = [
  {
    figure: "24",
    unit: "ct",
    title: "Le bouchon",
    text: "Laiton massif doré à l'or fin 24 carats, ciselé comme un bouton de rose.",
  },
  {
    figure: "100",
    unit: "ml",
    title: "Le verre",
    text: "Soufflé à la main en Normandie, torsadé comme un ruban de soie.",
  },
  {
    figure: "22",
    unit: "%",
    title: "Le jus",
    text: "D'essences pures pour douze heures de sillage. Rubis naturel, sans colorant.",
  },
];

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export function Flacon() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Les annotations suivent le flacon image par image : écriture directe dans le DOM, sans rendu React
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const stage = stageRef.current;
      if (!stage) return;
      const p = scrollYProgress.get();
      const exit = 1 - ramp(p, 0.88, 0.96);
      const desktop = window.innerWidth >= 768;

      // Toutes les lectures de mise en page d'abord, puis les écritures
      const s = stage.getBoundingClientRect();
      const rects = labels.current.map((el) => el?.getBoundingClientRect());

      PARTS.forEach((_, i) => {
        const a = 0.1 + i * 0.22;
        const x = sceneState.points[i][0] - s.left;
        const y = sceneState.points[i][1] - s.top;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        const dot = dots.current[i];
        if (dot) {
          const k = ramp(p, a - 0.02, a + 0.05) * exit;
          dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;
          dot.style.opacity = String(k);
        }

        const label = labels.current[i];
        if (label) {
          const k = ramp(p, a + 0.06, a + 0.16);
          label.style.opacity = String(k * exit);
          label.style.transform = `translate3d(0, ${(1 - k) * 28}px, 0)`;
        }

        const path = paths.current[i];
        const r = rects[i];
        if (path && r && desktop) {
          const lx = r.left - s.left - 18;
          const ly = r.top - s.top + 30;
          const mx = x + (lx - x) * 0.4;
          path.setAttribute("d", `M ${x} ${y} L ${mx} ${y} L ${lx - 44} ${ly} L ${lx} ${ly}`);
          path.style.strokeDashoffset = String(1 - ramp(p, a, a + 0.12));
          path.style.opacity = String(exit);
        }
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress]);

  return (
    <section
      id="flacon"
      ref={sectionRef}
      data-chapter="03 · Le flacon"
      data-bottle="showcase"
      {...tone("flacon")}
      className="relative z-10 h-[320vh]"
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        {/* Lignes d'annotation (desktop) */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block">
          {PARTS.map((part, i) => (
            <path
              key={part.title}
              ref={(el) => {
                paths.current[i] = el;
              }}
              pathLength={1}
              fill="none"
              stroke="rgb(247 236 227 / 0.7)"
              strokeWidth={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          ))}
        </svg>

        {/* Points posés sur le flacon */}
        {PARTS.map((part, i) => (
          <span
            key={part.title}
            ref={(el) => {
              dots.current[i] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 -ml-2.5 -mt-2.5 grid size-5 place-items-center rounded-full bg-cream text-[9px] font-medium text-crimson opacity-0 md:-ml-1.5 md:-mt-1.5 md:size-3"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-cream/60" />
            <span className="relative md:hidden">{i + 1}</span>
          </span>
        ))}

        <div className="absolute inset-x-5 top-20 flex items-center gap-4 md:inset-x-10 md:top-24">
          <span className="font-serif text-xl italic text-gold">03</span>
          <span className="h-px w-12 bg-cream/40" />
          <span className="eyebrow">Le flacon</span>
        </div>

        <div className="absolute inset-x-5 bottom-8 flex flex-col gap-6 md:inset-x-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:flex-row md:items-center md:justify-between">
          {/* Titre (colonne gauche) */}
          <div className="md:w-[30vw]">
            <Reveal
              text="Un flacon *comme un bijou.*"
              className="font-serif text-4xl leading-[0.95] md:text-[4.6vw]"
            />
            <p className="mt-6 hidden max-w-xs text-sm leading-relaxed text-cream/70 md:block">
              Dix-huit mois de dessin et trois artisans pour un seul geste : offrir la rose comme on
              offre une bague.
            </p>
          </div>

          {/* Annotations (colonne droite) */}
          <div className="flex flex-col gap-3 md:w-[22rem] md:gap-12">
            {PARTS.map((part, i) => (
              <div
                key={part.title}
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="grid grid-cols-[4.5rem_1fr] items-baseline gap-3 opacity-0 md:block"
              >
                <p className="font-serif text-3xl leading-none tabular-nums md:text-6xl">
                  {part.figure}
                  <span className="text-xl text-gold md:text-3xl">{part.unit}</span>
                </p>
                <div>
                  <p className="eyebrow text-gold! md:mt-3">
                    <span className="md:hidden">{i + 1} · </span>
                    {part.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-cream/70 md:mt-2 md:max-w-[17rem] md:text-sm">
                    {part.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
