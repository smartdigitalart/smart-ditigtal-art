export const CUSTOMER_STATUSES = ["Active", "Blocked"] as const

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string | null
  status: (typeof CUSTOMER_STATUSES)[number]
  role: "customer" | "admin"
  ordersCount: number
  totalSpent: number
  createdAt: string
}

export interface CustomerUpdatePayload {
  name: string
  phone: string
  status: Customer["status"]
}
