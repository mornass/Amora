-- Inscriptions à l'avant-première du parfum Amora (formulaire « Être prévenu »).
-- Appliquée au projet Supabase « Amora » (ovrmtkijduteligenzgi).
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null
    check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null default 'landing' check (char_length(source) <= 40),
  created_at timestamptz not null default now()
);

-- Une seule inscription par adresse, quelle que soit la casse
create unique index subscribers_email_key on public.subscribers (lower(email));

comment on table public.subscribers is 'Inscriptions à l''avant-première du parfum Amora (landing page).';

-- Le site public peut uniquement ajouter une adresse : ni lecture, ni modification, ni suppression.
alter table public.subscribers enable row level security;
revoke all on table public.subscribers from anon, authenticated;
grant insert (email, source) on table public.subscribers to anon;

create policy "Inscription publique en insertion seule"
  on public.subscribers
  for insert
  to anon
  with check (source = 'landing');
