import Link from "next/link"
import { PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ORDER_STATUS_STYLES } from "@/lib/types/order"
import { formatOrderId } from "@/lib/orders/format-order-id"
import { listMyOrdersAction } from "@/app/(store)/profile/orders/actions"

export default async function MyOrdersPage() {
  const orders = await listMyOrdersAction()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <div>
        <h1 className="text-xl font-bold text-foreground">Order history</h1>
        <p className="text-sm text-muted-foreground">
          Track and review your past orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <PackageIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              Start shopping
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/profile/orders/${order.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <PackageIcon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {formatOrderId(order.orderNumber)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 border-transparent ${ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </Badge>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    ৳{order.total.toFixed(2)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
