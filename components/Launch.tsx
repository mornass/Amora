"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bell } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { EASE_EXPO, LAUNCH_DATE } from "@/lib/launch";
import { tone } from "@/lib/chapters";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(): Remaining {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function Digit({ value, label }: { value: number | null; label: string }) {
  const text = value === null ? "--" : String(value).padStart(2, "0");
  return (
    <div className="flex flex-col border-l border-cream/20 pl-4 first:border-l-0 first:pl-0">
      <span className="relative h-[1em] overflow-hidden font-serif text-6xl leading-none tabular-nums md:text-7xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: EASE_EXPO }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-3 text-[10px] uppercase tracking-[0.3em] text-cream/60">{label}</span>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 1.2, ease: EASE_EXPO },
};

export function Launch() {
  // null côté serveur pour éviter tout écart d'hydratation
  const [left, setLeft] = useState<Remaining | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setLeft(getRemaining());
    const id = setInterval(() => setLeft(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="launch"
      data-chapter="04 · Lancement"
      data-bottle="right"
      {...tone("launch")}
      className="relative z-10 flex min-h-svh items-center px-5 py-32 md:px-10"
    >
      <div className="w-full pt-[38vh] md:w-[50%] md:pt-0">
        <motion.div {...reveal} className="mb-10 flex items-center gap-4">
          <span className="font-serif text-xl italic text-gold">04</span>
          <span className="h-px w-12 bg-cream/40" />
          <span className="eyebrow">Lancement mondial</span>
        </motion.div>
        <Reveal
          text="Le 21 décembre, *laissez-vous déclarer.*"
          className="font-serif text-5xl leading-[0.95] md:text-[5.5vw]"
        />

        <motion.div {...reveal} className="mt-12 grid grid-cols-4 gap-4">
          <Digit value={left?.days ?? null} label="Jours" />
          <Digit value={left?.hours ?? null} label="Heures" />
          <Digit value={left?.minutes ?? null} label="Minutes" />
          <Digit value={left?.seconds ?? null} label="Secondes" />
        </motion.div>

        <motion.div {...reveal} className="mt-14">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.p
                key="ok"
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 border-b border-cream/40 pb-4 font-serif text-2xl italic"
              >
                {/* Cœur Lottie qui éclot à l'inscription */}
                <span aria-hidden className="-my-4 -ml-3 size-16 shrink-0">
                  <DotLottieReact src="/lottie/amora-heart.json" autoplay />
                </span>
                Vous serez parmi les premiers à la découvrir.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0, y: -12 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="group flex items-center gap-3 border-b border-cream/40 pb-4 focus-within:border-cream"
              >
                <Bell className="size-5 shrink-0 text-gold" />
                <label htmlFor="email" className="sr-only">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre e-mail pour être prévenu"
                  className="min-w-0 flex-1 bg-transparent font-serif text-xl outline-none placeholder:text-cream/45 md:text-2xl"
                />
                <Magnetic strength={0.5}>
                  <button
                    type="submit"
                    aria-label="S'inscrire"
                    className="grid size-14 shrink-0 place-items-center rounded-full bg-cream text-crimson transition-colors duration-500 hover:bg-gold"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </Magnetic>
              </motion.form>
            )}
          </AnimatePresence>
          <p className="mt-4 text-xs text-cream/50">
            Avant-première, échantillon offert et accès à l&apos;édition numérotée.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
