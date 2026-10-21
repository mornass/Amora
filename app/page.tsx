"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { Preloader } from "@/components/Preloader";
import { PerfumeScene } from "@/components/PerfumeScene";
import { Backdrop } from "@/components/Backdrop";
import { Cursor } from "@/components/Cursor";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Notes } from "@/components/Notes";
import { Flacon } from "@/components/Flacon";
import { Marquee } from "@/components/Marquee";
import { Launch } from "@/components/Launch";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Défilement lissé (désactivé si l'utilisateur préfère réduire les animations)
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, anchors: { offset: 0 } });
    lenis.stop();
    lenisRef.current = lenis;
    return () => lenis.destroy();
  }, []);

  // Bloque le scroll pendant le preloader
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (ready) lenisRef.current?.start();
  }, [ready]);

  const handleComplete = useCallback(() => setReady(true), []);

  return (
    // reducedMotion="user" : Motion coupe les déplacements si le système le demande
    <MotionConfig reducedMotion="user">
      <Preloader progress={progress} onComplete={handleComplete} />
      <Backdrop />
      <PerfumeScene onProgress={setProgress} ready={ready} />
      <Cursor />
      <Header ready={ready} />

      <main>
        <Hero ready={ready} />
        <Manifesto />
        <Notes />
        <Flacon />
        <Marquee />
        <Launch />
      </main>
      <Footer />
    </MotionConfig>
  );
}
