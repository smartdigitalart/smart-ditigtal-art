export const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"] as const

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  parentId: string | null
  status: (typeof CATEGORY_STATUSES)[number]
  productCount: number
  createdAt: string
}

export interface CategoryPayload {
  id?: string
  name: string
  description: string
  image: string | null
  parentId: string | null
  status: Category["status"]
}
