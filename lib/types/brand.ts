export const BRAND_STATUSES = ["ACTIVE", "INACTIVE"] as const

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string | null
  status: (typeof BRAND_STATUSES)[number]
  featured: boolean
  productCount: number
  createdAt: string
}

export interface BrandPayload {
  id?: string
  name: string
  slug: string
  description: string
  logo: string | null
  status: Brand["status"]
  featured: boolean
}
