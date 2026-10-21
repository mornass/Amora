"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Sparkle } from "lucide-react";
import { LAUNCH_LABEL } from "@/lib/launch";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function Row({ baseVelocity, children }: { baseVelocity: number; children: React.ReactNode }) {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`);

  // La vitesse de défilement accélère et inverse le bandeau
  useAnimationFrame((_, delta) => {
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    base.set(base.get() + direction.current * baseVelocity * (delta / 1000) * (1 + Math.abs(f)));
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex shrink-0" style={{ x }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="flex shrink-0 items-center">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  const item = (
    <>
      <span className="px-8 font-serif text-[16vw] leading-none md:text-[9vw]">Amora</span>
      <Sparkle className="size-[4vw] shrink-0 fill-gold text-gold md:size-[2.5vw]" />
      <span className="px-8 font-serif text-[16vw] italic leading-none text-outline md:text-[9vw]">
        {LAUNCH_LABEL}
      </span>
      <Sparkle className="size-[4vw] shrink-0 fill-gold text-gold md:size-[2.5vw]" />
    </>
  );

  return (
    // z-0 : le bandeau passe derrière le flacon
    <section aria-hidden className="relative z-0 my-10 -rotate-3 border-y border-cream/20 bg-ink/40 py-6 backdrop-blur-sm">
      <Row baseVelocity={-2.5}>{item}</Row>
    </section>
  );
}
