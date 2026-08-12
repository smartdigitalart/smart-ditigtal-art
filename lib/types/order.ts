export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
  "Refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderItem {
  productId: string | null
  productSlug: string | null
  image: string | null
  productName: string
  quantity: number
  price: number
}

export type DeliveryZone = "inside_dhaka" | "outside_dhaka"

export interface Order {
  id: string
  orderNumber: number
  customerId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: string
  status: OrderStatus
  total: number
  shippingAddress: string | null
  deliveryZone: DeliveryZone | null
  deliveryCharge: number
  adminNotes: string | null
  items: OrderItem[]
  createdAt: string
}

export interface OrderStatusHistoryEntry {
  id: string
  status: OrderStatus
  changedBy: string | null
  changedByName: string | null
  createdAt: string
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  Processing: "bg-chart-1/10 text-chart-1",
  Completed: "bg-chart-2/10 text-chart-2",
  Cancelled: "bg-destructive/10 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
}
