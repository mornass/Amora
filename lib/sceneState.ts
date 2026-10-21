import type { RGB } from "./chapters";

/* État partagé entre la scène du flacon (qui l'écrit à chaque image)
   et les calques qui en dépendent : fond en soie, annotations du flacon. */
export const sceneState = {
  bg: [163, 16, 31] as RGB,
  glow: [239, 43, 52] as RGB,
  // Position du flacon à l'écran, en UV (0–1, y vers le haut) pour le halo du fond
  glowPos: [0.5, 0.5] as [number, number],
  // Vitesse de scroll normalisée (-1 à 1)
  velocity: 0,
  // Repères du flacon à l'écran, en pixels : bouchon, verre, jus
  points: [
    [0, 0],
    [0, 0],
    [0, 0],
  ] as [number, number][],
};
