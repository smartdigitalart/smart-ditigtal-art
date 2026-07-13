export const BLOG_STATUSES = ["Published", "Draft", "Scheduled"] as const

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  coverImage: string | null
  category: string | null
  author: string | null
  status: (typeof BLOG_STATUSES)[number]
  views: number
  publishedAt: string | null
  createdAt: string
}

export interface BlogPayload {
  id?: string
  title: string
  slug: string
  content: string
  coverImage: string | null
  status: Blog["status"]
}
