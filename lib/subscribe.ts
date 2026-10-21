// Inscriptions à l'avant-première, stockées dans le projet Supabase « Amora » (table public.subscribers).
// La clé publiable est faite pour être exposée dans le navigateur : les règles de la table
// n'autorisent que l'ajout d'une adresse (ni lecture, ni modification, ni suppression).
// Schéma et règles : supabase/migrations/20261021000000_create_subscribers.sql
const SUPABASE_URL = "https://ovrmtkijduteligenzgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Gq8_nQm-UYkLUAhOscs9xA_m9NRpvPh";

export type SubscribeResult = "created" | "already";

export async function subscribe(email: string): Promise<SubscribeResult> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
      // Pas de lecture en retour : la clé publique n'a pas le droit de lire la table
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), source: "landing" }),
  });
  if (res.status === 201) return "created";
  // Adresse déjà présente (index unique) : l'inscription est acquise
  if (res.status === 409) return "already";
  throw new Error(`Inscription refusée (${res.status})`);
}
