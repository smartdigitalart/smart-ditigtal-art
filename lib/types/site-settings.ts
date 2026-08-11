export interface HeroBanner {
  id: string
  imageUrl: string
  alt: string
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
  socialLinks: SiteSocialLinks
}

export interface SiteSettingsPayload {
  heroBanners: HeroBanner[]
  socialLinks: SiteSocialLinks
}
