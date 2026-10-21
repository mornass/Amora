// Fond fixe : couleurs pilotées par les chapitres (variables CSS mises à jour par la scène 3D)
export function Backdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-[rgb(var(--bg))]">
      {/* Halo qui suit le flacon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(38vmax 46vmax at var(--gx) var(--gy), rgb(var(--glow) / 0.75), rgb(var(--glow) / 0.18) 45%, transparent 72%)",
        }}
      />
      {/* Vignettage pour la profondeur */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgb(12 0 2 / 0.6) 100%)" }}
      />
    </div>
  );
}
