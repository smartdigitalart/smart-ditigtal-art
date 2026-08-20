export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const

export interface ProductImageRecord {
  id: string
  url: string
}

export interface ProductVariant {
  id?: string
  label: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  categoryId: string
  brandId: string
  price: number
  salePrice: number | null
  inStock: boolean
  status: (typeof PRODUCT_STATUSES)[number]
  featured: boolean
  isNewArrival: boolean
  isFlashDeal: boolean
  description: string
  shortDescription: string
  images: ProductImageRecord[]
  variants: ProductVariant[]
  createdAt: string
}

export interface ProductPayload {
  id?: string
  name: string
  categoryId: string
  brandId: string
  price: number
  salePrice: number | null
  inStock: boolean
  status: Product["status"]
  featured: boolean
  isNewArrival: boolean
  isFlashDeal: boolean
  description: string
  shortDescription: string
  images: ProductImageRecord[]
  variants: ProductVariant[]
}
