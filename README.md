# Amora — Landing page de lancement

Landing page annonçant la sortie du parfum **Amora** le 21 décembre 2026.

Stack : Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Three.js · LottieFiles (dotLottie) · Lucide.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure

- `components/Preloader.tsx` — preloader (animation Lottie `public/lottie/amora-loader.json`, compteur lié au chargement réel du modèle, sortie en rideau).
- `components/PerfumeScene.tsx` — canvas Three.js fixe : le flacon `public/models/parfum.glb` reste à l'écran pendant toute l'expérience. Le scroll pilote sa rotation (2 tours sur la page) ; chaque section déclare la position du flacon via `data-bottle`.
- `components/Hero.tsx`, `Manifesto.tsx`, `Marquee.tsx`, `Notes.tsx`, `Launch.tsx`, `Footer.tsx` — les sections.
- `lib/launch.ts` — date de lancement (compte à rebours).

Modèle 3D « Parfum Bottle » par AT design studio (Sketchfab, licence Sketchfab Standard — crédit affiché dans le footer).
