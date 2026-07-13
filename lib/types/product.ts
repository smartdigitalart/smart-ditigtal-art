export const PRODUCT_STATUSES = ["ACTIVE", "DRAFT", "OUT_OF_STOCK"] as const

export interface ProductSpecification {
  name: string
  value: string
}

export interface ProductImageRecord {
  id: string
  url: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  categoryId: string
  brandId: string
  price: number
  stock: number
  status: (typeof PRODUCT_STATUSES)[number]
  description: string
  shortDescription: string
  specifications: ProductSpecification[]
  images: ProductImageRecord[]
  createdAt: string
}

export interface ProductPayload {
  id?: string
  name: string
  sku: string
  categoryId: string
  brandId: string
  price: number
  stock: number
  status: Product["status"]
  description: string
  shortDescription: string
  specifications: ProductSpecification[]
  images: ProductImageRecord[]
}
