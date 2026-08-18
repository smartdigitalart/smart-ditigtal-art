export interface HeroBanner {
  id: string
  imageUrl: string
  alt: string
}

export interface CategoryPromoCard {
  id: "art" | "perfume"
  href: string
  imageUrl: string
  alt: string
  eyebrow: string
  title: string
  cta: string
}

export interface SiteSocialLinks {
  facebook: string
  instagram: string
  messenger: string
  whatsapp: string
  email: string
}

export interface SiteSettings {
  id: "main"
  heroBanners: HeroBanner[]
  categoryPromoCards: CategoryPromoCard[]
  socialLinks: SiteSocialLinks
}

export interface SiteSettingsPayload {
  heroBanners: HeroBanner[]
  categoryPromoCards: CategoryPromoCard[]
  socialLinks: SiteSocialLinks
}
