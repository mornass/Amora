"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { tone } from "@/lib/chapters";
import { EASE_EXPO } from "@/lib/launch";
import { FadeUp, Reveal } from "./Reveal";

const FIGURES = [
  { value: 22, unit: "%", label: "d'essences — concentration Eau de Parfum" },
  { value: 12, unit: "h", label: "de tenue sur la peau" },
  { value: 11, unit: "", label: "matières premières, dont 4 de Grasse" },
  { value: 100, unit: "ml", label: "flacon de verre soufflé, rechargeable" },
];

// Chiffre qui compte jusqu'à sa valeur à l'entrée dans l'écran
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 2, ease: EASE_EXPO, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}

export function Craft() {
  return (
    <section
      id="craft"
      data-chapter="03 · Savoir-faire"
      data-bottle="left"
      {...tone("craft")}
      className="relative z-10 flex min-h-svh items-center px-5 py-32 md:justify-end md:px-10"
    >
      <div className="pt-[34vh] md:w-[48%] md:pt-0">
        <FadeUp className="mb-10 flex items-center gap-4">
          <span className="font-serif text-xl italic text-gold">03</span>
          <span className="h-px w-12 bg-cream/40" />
          <span className="eyebrow">Savoir-faire</span>
        </FadeUp>

        <Reveal
          text="Composé à Grasse, *soufflé à la main.*"
          className="font-serif text-5xl leading-[0.95] md:text-[5vw]"
        />

        <FadeUp delay={0.15} className="mt-8 max-w-md text-sm leading-relaxed text-cream/75">
          Notre parfumeur a travaillé dix-huit mois sur cette rose. Chaque flacon est soufflé par un
          verrier de Normandie, puis coiffé d&apos;un bouchon en laiton doré à l&apos;or fin.
        </FadeUp>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10">
          {FIGURES.map((f, i) => (
            <FadeUp key={f.label} delay={0.1 * i} className="border-t border-cream/25 pt-4">
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-serif text-5xl leading-none md:text-6xl">
                <Counter value={f.value} />
                <span className="text-gold">{f.unit}</span>
              </dd>
              <dd className="mt-3 max-w-[14rem] text-xs leading-relaxed text-cream/60">{f.label}</dd>
            </FadeUp>
          ))}
        </dl>
      </div>
    </section>
  );
}
