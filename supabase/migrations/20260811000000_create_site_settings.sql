create table if not exists public.site_settings (
  id text primary key default 'main',
  hero_banners jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'main')
);

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

grant select on public.site_settings to anon, authenticated;

insert into public.site_settings (id, hero_banners, social_links)
values (
  'main',
  '[
    {
      "id": "banner-1",
      "imageUrl": "/banner-1.jpeg",
      "alt": "Smart Digital Art banner 1"
    },
    {
      "id": "banner-2",
      "imageUrl": "/banner-2.jpeg",
      "alt": "Smart Digital Art banner 2"
    }
  ]'::jsonb,
  '{
    "facebook": "https://facebook.com/",
    "instagram": "https://instagram.com/",
    "messenger": "https://m.me/",
    "whatsapp": "",
    "email": "info@smartdigitalartbd.com"
  }'::jsonb
)
on conflict (id) do update
set social_links = public.site_settings.social_links || excluded.social_links,
    updated_at = public.site_settings.updated_at;
