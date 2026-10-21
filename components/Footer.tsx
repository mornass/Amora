import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer
      data-bottle="outro"
      className="relative z-10 flex flex-col gap-6 border-t border-cream/15 px-5 py-10 text-xs text-cream/60 md:flex-row md:items-center md:justify-between md:px-10"
    >
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
      <a href="#top" className="flex items-center gap-2 uppercase tracking-[0.3em] hover:text-cream">
        Haut de page <ArrowUp className="size-3.5" />
      </a>
    </footer>
  );
}
