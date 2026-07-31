import { notFound } from "next/navigation"

import { OrderDetail } from "@/components/orders/order-detail"
import { getMyOrderByIdAction } from "@/app/(store)/profile/orders/actions"

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getMyOrderByIdAction(id)

  if (!order) {
    notFound()
  }

  return <OrderDetail order={order} viewer="customer" />
}
