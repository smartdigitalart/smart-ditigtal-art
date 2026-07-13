"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2,
  PackageIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { useUpdateOrderStatus } from "@/lib/api/use-admin-orders"
import { type Order, type OrderStatus } from "@/lib/types/order"

const STATUS_ITEMS: { label: string; value: OrderStatus; icon: React.ReactNode }[] = [
  { label: "Pending", value: "Pending", icon: <ClockIcon className="text-chart-3" /> },
  { label: "Processing", value: "Processing", icon: <RefreshCcwIcon className="text-chart-1" /> },
  { label: "Completed", value: "Completed", icon: <CheckCircle2Icon className="text-chart-2" /> },
  { label: "Cancelled", value: "Cancelled", icon: <XCircleIcon className="text-destructive" /> },
  { label: "Refunded", value: "Refunded", icon: <RotateCcwIcon className="text-muted-foreground" /> },
]

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  Processing: "bg-chart-1/10 text-chart-1",
  Completed: "bg-chart-2/10 text-chart-2",
  Cancelled: "bg-destructive/10 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
}

export function OrderDetail({ order }: { order: Order }) {
  const router = useRouter()
  const updateStatus = useUpdateOrderStatus()
  const [savedStatus, setSavedStatus] = useState<OrderStatus>(order.status)
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const saving = updateStatus.isPending

  const handleSave = async () => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      setSavedStatus(status)
      toast.success(`${order.id} updated to ${status}`)
    } catch {
      toast.error("Failed to update order status")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2"
            onClick={() => router.push("/admin/orders")}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back to orders
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`border-transparent ${STATUS_STYLES[savedStatus]}`}
        >
          {savedStatus}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length > 1 ? "s" : ""} in
                this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.items.map((item, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <PackageIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {item.productName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total
              </span>
              <span className="text-lg font-bold text-foreground">
                ৳{order.total.toFixed(2)}
              </span>
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/admin/customers/${order.customerId}/edit`}
                className="group flex flex-col gap-1"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                  {order.customerName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {order.customerEmail}
                </span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-foreground">
                {order.paymentMethod}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order status</CardTitle>
              <CardDescription>Update the fulfillment status.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="order-status">Status</FieldLabel>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      value && setStatus(value as OrderStatus)
                    }
                  >
                    <SelectTrigger id="order-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STATUS_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.icon}
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || status === savedStatus}
              >
                {saving && <Loader2 className="animate-spin" />}
                Update status
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
