/* =========================================================
   Chapitres : chaque section déclare sa couleur et la pose du
   flacon via des attributs data-*. Le scroll interpole entre eux.
   ========================================================= */

export type Pose = { x: number; y: number; s: number };
export type RGB = [number, number, number];

// x / y : fraction de la demi-largeur / demi-hauteur visible — s : échelle
export const POSES: Record<string, { desktop: Pose; mobile: Pose }> = {
  hero: { desktop: { x: 0, y: -0.04, s: 1 }, mobile: { x: 0, y: 0.04, s: 0.8 } },
  right: { desktop: { x: 0.5, y: 0, s: 0.92 }, mobile: { x: 0.5, y: 0.6, s: 0.32 } },
  center: { desktop: { x: 0, y: 0, s: 1.08 }, mobile: { x: 0, y: 0.32, s: 0.62 } },
  left: { desktop: { x: -0.5, y: 0, s: 0.92 }, mobile: { x: 0, y: 0.5, s: 0.44 } },
  // Chapitre « Le flacon » : grand et centré, les annotations se placent autour
  showcase: { desktop: { x: 0.02, y: -0.02, s: 1.2 }, mobile: { x: 0, y: 0.36, s: 0.5 } },
  // Pied de page : le flacon se pose devant le grand « AMORA », en écho au hero
  outro: { desktop: { x: 0, y: -0.06, s: 0.78 }, mobile: { x: 0, y: -0.2, s: 0.46 } },
};

type Anchor = {
  at: number;
  pose: string;
  bg: RGB;
  glow: RGB;
  liquid: RGB;
  label: string;
};

export type ChapterState = {
  pose: Pose;
  bg: RGB;
  glow: RGB;
  liquid: RGB;
  label: string;
};

const hex = (value: string): RGB => {
  const n = parseInt(value.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const ease = (t: number) => t * t * (3 - 2 * t);

export function measureChapters(): Anchor[] {
  const vh = window.innerHeight;
  const anchors: Anchor[] = [];

  document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const base = {
      pose: el.dataset.bottle ?? "center",
      bg: hex(el.dataset.bg ?? "#a3101f"),
      glow: hex(el.dataset.glow ?? "#e3262f"),
      liquid: hex(el.dataset.liquid ?? "#7a0611"),
      label: el.dataset.chapter ?? "",
    };
    // Les éléments hauts gardent leur état sur toute leur durée
    if (el.offsetHeight > vh * 1.4) {
      anchors.push({ ...base, at: top }, { ...base, at: top + el.offsetHeight - vh });
    } else {
      anchors.push({ ...base, at: top + el.offsetHeight / 2 - vh / 2 });
    }
  });

  // Bornés à la plage réellement scrollable : le dernier état est atteint en bas de page
  const max = document.documentElement.scrollHeight - vh;
  anchors.forEach((a) => (a.at = Math.min(Math.max(a.at, 0), max)));
  return anchors.sort((a, b) => a.at - b.at);
}

export function sampleChapters(anchors: Anchor[], scroll: number, mobile: boolean): ChapterState | null {
  if (!anchors.length) return null;
  const pose = (name: string) => (mobile ? POSES[name].mobile : POSES[name].desktop);
  const state = (a: Anchor): ChapterState => ({ ...a, pose: pose(a.pose) });

  if (scroll <= anchors[0].at) return state(anchors[0]);
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (scroll > b.at) continue;
    const t = b.at === a.at ? 1 : ease((scroll - a.at) / (b.at - a.at));
    const pa = pose(a.pose);
    const pb = pose(b.pose);
    return {
      pose: {
        x: pa.x + (pb.x - pa.x) * t,
        y: pa.y + (pb.y - pa.y) * t,
        s: pa.s + (pb.s - pa.s) * t,
      },
      bg: mix(a.bg, b.bg, t),
      glow: mix(a.glow, b.glow, t),
      liquid: mix(a.liquid, b.liquid, t),
      label: t < 0.5 ? a.label : b.label,
    };
  }
  return state(anchors[anchors.length - 1]);
}

export const toTriplet = (c: RGB) => `${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])}`;

export const CHAPTER_EVENT = "amora:chapter";

// Palette par chapitre : fond, halo derrière le flacon, teinte du jus
export const TONES = {
  hero: { bg: "#a3101f", glow: "#ef2b34", liquid: "#8a0714" },
  manifesto: { bg: "#3b050c", glow: "#9c1020", liquid: "#7a0611" },
  top: { bg: "#b4231b", glow: "#ff6a3d", liquid: "#c0261a" },
  heart: { bg: "#850a29", glow: "#ec3f72", liquid: "#8c0620" },
  base: { bg: "#3e0d09", glow: "#b8501f", liquid: "#6a1a08" },
  flacon: { bg: "#4a0610", glow: "#c8202c", liquid: "#8a0714" },
  launch: { bg: "#22050a", glow: "#8a0c1a", liquid: "#8a0714" },
  outro: { bg: "#160305", glow: "#a3101f", liquid: "#8a0714" },
} as const;

export const tone = (name: keyof typeof TONES) => ({
  "data-bg": TONES[name].bg,
  "data-glow": TONES[name].glow,
  "data-liquid": TONES[name].liquid,
});
