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

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <OrderDetail order={order} viewer="customer" />
    </div>
  )
}
