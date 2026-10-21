# Amora — Landing page de lancement

Landing page annonçant la sortie du parfum **Amora** le 21 décembre 2026.

Stack : Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Three.js · LottieFiles (dotLottie) · Lucide · Lenis.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Direction artistique

Quatre chapitres numérotés, chacun avec sa teinte de rouge :

| Chapitre | Contenu | Teinte |
| --- | --- | --- |
| Hero | « AMORA » géant derrière le flacon | rouge Amora |
| 01 · Manifeste | texte révélé mot par mot | bordeaux |
| 02 · Pyramide olfactive | notes de tête, de cœur, de fond (section collante) | vermillon, cerise, ambre |
| 03 · Le flacon | annotations reliées au flacon 3D | vin |
| 04 · Lancement | compte à rebours et inscription | encre rouge |
| Pied de page | « AMORA » géant, en écho au hero | encre rouge |

## Fonctionnement

- `lib/chapters.ts` : chaque section déclare sa teinte (`data-bg`, `data-glow`, `data-liquid`) et la pose du flacon (`data-bottle`). Le scroll interpole entre ces repères ; la palette est dans `TONES`.
- `components/PerfumeScene.tsx` : flacon `public/models/parfum.glb` (Three.js), fixe pendant toute l'expérience. Le scroll pilote sa rotation (2 tours) ; le jus prend la teinte du chapitre ; particules dorées.
- `components/Backdrop.tsx` : fond en satin rouge (shader WebGL, demi-résolution) dont les couleurs suivent les chapitres.
- `lib/sceneState.ts` : état partagé écrit par la scène 3D (couleurs, position du flacon à l'écran, repères des annotations).
- `components/Flacon.tsx` : annotations du chapitre « Le flacon », redessinées à chaque image pour suivre le flacon.
- `components/Preloader.tsx` : preloader avec animation Lottie (`public/lottie/amora-loader.json`) ; `public/lottie/amora-heart.json` s'anime à l'inscription.
- `app/page.tsx` : défilement lissé par Lenis ; `MotionConfig reducedMotion="user"` respecte le réglage « réduire les animations » du système.

## Inscriptions (Supabase)

Le formulaire « Être prévenu » enregistre les adresses dans le projet Supabase **Amora** (région Paris), table `public.subscribers`.

- `lib/subscribe.ts` : envoi depuis le navigateur avec la clé publiable du projet. Elle est faite pour être publique : les règles de la table n'autorisent que l'ajout d'une adresse (ni lecture, ni modification, ni suppression).
- `supabase/migrations/20261021000000_create_subscribers.sql` : schéma, index unique (une inscription par adresse, sans tenir compte de la casse) et règles d'accès.
- Consulter ou exporter les inscriptions : Supabase → projet Amora → Table Editor → `subscribers` → Export (CSV).
- Un projet gratuit se met en pause après 7 jours sans activité. Le réactiver depuis le tableau de bord Supabase si le formulaire affiche une erreur.

Modèle 3D « Parfum Bottle » par AT design studio (Sketchfab, licence Sketchfab Standard — crédit affiché dans le footer).
