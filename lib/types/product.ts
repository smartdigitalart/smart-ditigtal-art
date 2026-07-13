export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const

export interface ProductImageRecord {
  id: string
  url: string
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
  description: string
  shortDescription: string
  images: ProductImageRecord[]
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
  description: string
  shortDescription: string
  images: ProductImageRecord[]
}
