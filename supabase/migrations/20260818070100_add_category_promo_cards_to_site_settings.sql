alter table public.site_settings
add column if not exists category_promo_cards jsonb not null default '[]'::jsonb;

update public.site_settings
set category_promo_cards = '[
  {
    "id": "art",
    "href": "/shop?category=painting",
    "imageUrl": "/banner-1.jpeg",
    "alt": "Art collection preview",
    "eyebrow": "Handmade & Digital",
    "title": "Art",
    "cta": "Shop Art Collection"
  },
  {
    "id": "perfume",
    "href": "/shop?category=perfume",
    "imageUrl": "/banner-2.jpeg",
    "alt": "Perfume collection preview",
    "eyebrow": "Signature Scents",
    "title": "Perfume",
    "cta": "Shop Perfume Collection"
  }
]'::jsonb,
updated_at = now()
where id = 'main'
  and category_promo_cards = '[]'::jsonb;
