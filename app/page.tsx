"use client";

import { useCallback, useEffect, useState } from "react";
import { Preloader } from "@/components/Preloader";
import { PerfumeScene } from "@/components/PerfumeScene";
import { Backdrop } from "@/components/Backdrop";
import { Cursor } from "@/components/Cursor";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Marquee } from "@/components/Marquee";
import { Notes } from "@/components/Notes";
import { Launch } from "@/components/Launch";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Bloque le scroll pendant le preloader et repart toujours du haut
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = ready ? "" : "hidden";
  }, [ready]);

  const handleComplete = useCallback(() => setReady(true), []);

  return (
    <>
      <Preloader progress={progress} onComplete={handleComplete} />
      <Backdrop />
      <PerfumeScene onProgress={setProgress} ready={ready} />
      <Cursor />
      <Header ready={ready} />

      <main>
        <Hero ready={ready} />
        <Manifesto />
        <Marquee />
        <Notes />
        <Launch />
      </main>
      <Footer />
    </>
  );
}
