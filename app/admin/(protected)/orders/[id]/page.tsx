import { notFound } from "next/navigation"

import { OrderDetail } from "@/components/orders/order-detail"
import { getOrderById } from "@/lib/mock-orders"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = getOrderById(id)

  if (!order) {
    notFound()
  }

  return <OrderDetail order={order} />
}
