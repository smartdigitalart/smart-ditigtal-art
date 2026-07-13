import { notFound } from "next/navigation"

import { OrderDetail } from "@/components/orders/order-detail"
import { getOrderByIdAction } from "@/app/admin/(protected)/orders/actions"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderByIdAction(id)

  if (!order) {
    notFound()
  }

  return <OrderDetail order={order} />
}
