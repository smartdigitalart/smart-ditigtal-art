export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
  "Refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderItem {
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerId: string | null
  customerName: string
  customerEmail: string
  paymentMethod: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: string
}
