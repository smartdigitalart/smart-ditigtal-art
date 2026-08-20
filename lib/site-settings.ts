import { createClient } from "@/lib/supabase/server"
import type {
  CategoryPromoCard,
  HeroBanner,
  SiteSettings,
  SiteSocialLinks,
} from "@/lib/types/site-settings"

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  { id: "banner-1", imageUrl: "/banner-1.jpeg", alt: "Smart Digital Art banner 1" },
  { id: "banner-2", imageUrl: "/banner-2.jpeg", alt: "Smart Digital Art banner 2" },
]

export const DEFAULT_CATEGORY_PROMO_CARDS: CategoryPromoCard[] = [
  {
    id: "art",
    href: "/shop?category=painting",
    imageUrl: "/banner-1.jpeg",
    alt: "Art collection preview",
    eyebrow: "Handmade & Digital",
    title: "Art",
    cta: "Shop Art Collection",
  },
  {
    id: "perfume",
    href: "/shop?category=perfume",
    imageUrl: "/banner-2.jpeg",
    alt: "Perfume collection preview",
    eyebrow: "Signature Scents",
    title: "Perfume",
    cta: "Shop Perfume Collection",
  },
]

export const DEFAULT_SOCIAL_LINKS: SiteSocialLinks = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  messenger: "https://m.me/",
  whatsapp: "",
  email: "info@smartdigitalartbd.com",
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function normalizeHeroBanners(value: unknown): HeroBanner[] {
  if (!Array.isArray(value)) return DEFAULT_HERO_BANNERS

  const banners = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, unknown>
      const imageUrl = asString(row.imageUrl)
      if (!imageUrl) return null

      return {
        id: asString(row.id, `banner-${index + 1}`),
        imageUrl,
        alt: asString(row.alt, `Smart Digital Art banner ${index + 1}`),
      }
    })
    .filter((item): item is HeroBanner => !!item)

  return banners.length ? banners : DEFAULT_HERO_BANNERS
}

function normalizeCategoryPromoCards(value: unknown): CategoryPromoCard[] {
  if (!Array.isArray(value)) return DEFAULT_CATEGORY_PROMO_CARDS

  return DEFAULT_CATEGORY_PROMO_CARDS.map((fallback) => {
    const match = value.find((item) => {
      if (!item || typeof item !== "object") return false
      return (item as Record<string, unknown>).id === fallback.id
    })

    if (!match || typeof match !== "object") return fallback

    const row = match as Record<string, unknown>
    const imageUrl = asString(row.imageUrl, fallback.imageUrl)

    return {
      id: fallback.id,
      href: asString(row.href, fallback.href),
      imageUrl: imageUrl || fallback.imageUrl,
      alt: asString(row.alt, fallback.alt),
      eyebrow: asString(row.eyebrow, fallback.eyebrow),
      title: asString(row.title, fallback.title),
      cta: asString(row.cta, fallback.cta),
    }
  })
}

function normalizeHeaderCategoryIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function normalizeSocialLinks(value: unknown): SiteSocialLinks {
  if (!value || typeof value !== "object") return DEFAULT_SOCIAL_LINKS
  const links = value as Record<string, unknown>

  return {
    facebook: asString(links.facebook, DEFAULT_SOCIAL_LINKS.facebook),
    instagram: asString(links.instagram, DEFAULT_SOCIAL_LINKS.instagram),
    messenger: asString(links.messenger, DEFAULT_SOCIAL_LINKS.messenger),
    whatsapp: asString(links.whatsapp, DEFAULT_SOCIAL_LINKS.whatsapp),
    email: asString(links.email, DEFAULT_SOCIAL_LINKS.email),
  }
}

export function normalizeSiteSettings(row: Record<string, unknown> | null): SiteSettings {
  if (!row) {
    return {
      id: "main",
      heroBanners: DEFAULT_HERO_BANNERS,
      categoryPromoCards: DEFAULT_CATEGORY_PROMO_CARDS,
      socialLinks: DEFAULT_SOCIAL_LINKS,
      headerCategoryIds: [],
    }
  }

  const socialLinksRow =
    row.social_links && typeof row.social_links === "object"
      ? (row.social_links as Record<string, unknown>)
      : undefined

  return {
    id: "main",
    heroBanners: normalizeHeroBanners(row.hero_banners),
    categoryPromoCards: normalizeCategoryPromoCards(
      row.category_promo_cards ?? socialLinksRow?.categoryPromoCards
    ),
    socialLinks: normalizeSocialLinks(row.social_links),
    headerCategoryIds: normalizeHeaderCategoryIds(socialLinksRow?.headerCategoryIds),
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_banners, social_links")
    .eq("id", "main")
    .maybeSingle()

  if (error) {
    return normalizeSiteSettings(null)
  }

  return normalizeSiteSettings(data)
}
