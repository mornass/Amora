// Texte dont les lettres roulent vers le haut au survol du parent `.group` (styles dans globals.css)
export function RollText({ text }: { text: string }) {
  return (
    <span className="roll" aria-label={text}>
      {text.split("").map((char, i) => {
        const c = char === " " ? " " : char;
        return (
          <span key={i} aria-hidden data-c={c} style={{ transitionDelay: `${i * 22}ms` }}>
            {c}
          </span>
        );
      })}
    </span>
  );
}
