import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Amora — Le nouveau parfum · 21.12.2026",
  description:
    "Amora, la nouvelle Eau de Parfum. Une rose sombre, un éclat de poivre, un sillage ambré. Lancement le 21 décembre 2026.",
};

export const viewport: Viewport = {
  themeColor: "#a50f1c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${instrument.variable} ${manrope.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
