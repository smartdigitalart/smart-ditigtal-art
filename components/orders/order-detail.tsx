"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2,
  PackageIcon,
  PencilIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  StickyNoteIcon,
  Trash2Icon,
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog"
import {
  useDeleteOrder,
  useOrderStatusHistory,
  useUpdateOrderNotes,
  useUpdateOrderShippingAddress,
  useUpdateOrderStatus,
} from "@/lib/api/use-admin-orders"
import { ORDER_STATUS_STYLES, type Order, type OrderStatus } from "@/lib/types/order"
import { formatOrderId } from "@/lib/orders/format-order-id"

const STATUS_ITEMS: { label: string; value: OrderStatus; icon: React.ReactNode }[] = [
  { label: "Pending", value: "Pending", icon: <ClockIcon className="text-chart-3" /> },
  { label: "Processing", value: "Processing", icon: <RefreshCcwIcon className="text-chart-1" /> },
  { label: "Completed", value: "Completed", icon: <CheckCircle2Icon className="text-chart-2" /> },
  { label: "Cancelled", value: "Cancelled", icon: <XCircleIcon className="text-destructive" /> },
  { label: "Refunded", value: "Refunded", icon: <RotateCcwIcon className="text-muted-foreground" /> },
]

const DELIVERY_ZONE_LABELS: Record<string, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
}

export function OrderDetail({
  order,
  viewer = "admin",
}: {
  order: Order
  viewer?: "admin" | "customer"
}) {
  const router = useRouter()
  const isAdmin = viewer === "admin"
  const updateStatus = useUpdateOrderStatus()
  const updateNotes = useUpdateOrderNotes()
  const updateShippingAddress = useUpdateOrderShippingAddress()
  const deleteOrder = useDeleteOrder()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data: statusHistory, isLoading: historyLoading } = useOrderStatusHistory(
    order.id,
    isAdmin
  )
  const [savedStatus, setSavedStatus] = useState<OrderStatus>(order.status)
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const saving = updateStatus.isPending

  const [editingAddress, setEditingAddress] = useState(false)
  const [addressDraft, setAddressDraft] = useState(order.shippingAddress ?? "")
  const [savedAddress, setSavedAddress] = useState(order.shippingAddress ?? "")

  const [notesDraft, setNotesDraft] = useState(order.adminNotes ?? "")
  const [savedNotes, setSavedNotes] = useState(order.adminNotes ?? "")

  const handleSave = async () => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      setSavedStatus(status)
      toast.success(`${formatOrderId(order.orderNumber)} updated to ${status}`)
    } catch {
      toast.error("Failed to update order status")
    }
  }

  const handleSaveAddress = async () => {
    try {
      await updateShippingAddress.mutateAsync({
        id: order.id,
        shippingAddress: addressDraft,
      })
      setSavedAddress(addressDraft)
      setEditingAddress(false)
      toast.success("Shipping address updated")
    } catch {
      toast.error("Failed to update shipping address")
    }
  }

  const handleSaveNotes = async () => {
    try {
      await updateNotes.mutateAsync({ id: order.id, adminNotes: notesDraft })
      setSavedNotes(notesDraft)
      toast.success("Notes saved")
    } catch {
      toast.error("Failed to save notes")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id)
      toast.success(`Deleted ${formatOrderId(order.orderNumber)}`)
      router.push("/admin/orders")
    } catch {
      toast.error("Failed to delete order")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() =>
            router.push(viewer === "admin" ? "/admin/orders" : "/profile/orders")
          }
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to orders
        </Button>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {formatOrderId(order.orderNumber)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <span className="mt-3 block text-2xl font-bold text-foreground">
              ৳{order.total.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Select
                  value={status}
                  onValueChange={(value) =>
                    value && setStatus(value as OrderStatus)
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className={`w-36 border-transparent font-medium ${ORDER_STATUS_STYLES[status]}`}
                  >
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
                {status !== savedStatus && (
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="animate-spin" />}
                    Save
                  </Button>
                )}
              </div>
            ) : (
              <Badge
                variant="outline"
                className={`border-transparent ${ORDER_STATUS_STYLES[savedStatus]}`}
              >
                {savedStatus}
              </Badge>
            )}
          </div>
        </div>
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
            <CardContent className="flex flex-col gap-4">
              {order.items.map((item, index) => {
                const href = isAdmin
                  ? item.productId
                    ? `/admin/products/${item.productId}/edit`
                    : null
                  : item.productSlug
                    ? `/products/${item.productSlug}`
                    : null

                const row = (
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <PackageIcon className="size-5" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.productName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ৳{item.price.toFixed(2)} each
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                )

                return (
                  <div key={index}>
                    {index > 0 && <Separator className="mb-4" />}
                    {href ? (
                      <Link
                        href={href}
                        className="-m-1 block rounded-lg p-1 transition-colors hover:bg-muted/50"
                      >
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </div>
                )
              })}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums text-foreground">
                  ৳{(order.total - order.deliveryCharge).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="tabular-nums text-foreground">
                  ৳{order.deliveryCharge.toFixed(2)}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">
                  ৳{order.total.toFixed(2)}
                </span>
              </div>
            </CardFooter>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNoteIcon className="size-4" />
                  Internal notes
                </CardTitle>
                <CardDescription>
                  Private to admins. Never shown to the customer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  placeholder="e.g. Called customer to confirm address..."
                  rows={4}
                />
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button
                  size="sm"
                  disabled={updateNotes.isPending || notesDraft === savedNotes}
                  onClick={handleSaveNotes}
                >
                  {updateNotes.isPending && <Loader2 className="animate-spin" />}
                  Save notes
                </Button>
              </CardFooter>
            </Card>
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Status history</CardTitle>
                <CardDescription>Audit trail of status changes.</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : statusHistory && statusHistory.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {statusHistory.map((entry) => (
                      <li key={entry.id} className="flex items-start gap-3">
                        <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {entry.status}
                            {entry.changedByName && (
                              <span className="font-normal text-muted-foreground">
                                {" "}
                                &middot; {entry.changedByName}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No status changes recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {viewer === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/admin/customers/${order.customerId}/edit`}
                  className="group flex flex-col gap-1"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">
                    {order.customerName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {order.customerEmail}
                  </span>
                </Link>
              </CardContent>
            </Card>
          )}

          {(savedAddress || order.deliveryZone || isAdmin) && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Shipping</CardTitle>
                {isAdmin && !editingAddress && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit shipping address"
                    onClick={() => {
                      setAddressDraft(savedAddress)
                      setEditingAddress(true)
                    }}
                  >
                    <PencilIcon />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {editingAddress ? (
                  <>
                    <Textarea
                      value={addressDraft}
                      onChange={(event) => setAddressDraft(event.target.value)}
                      placeholder="Shipping address"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAddress(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={updateShippingAddress.isPending}
                        onClick={handleSaveAddress}
                      >
                        {updateShippingAddress.isPending && (
                          <Loader2 className="animate-spin" />
                        )}
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {savedAddress ? (
                      <span className="text-sm text-foreground">
                        {savedAddress}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No address on file.
                      </span>
                    )}
                    {order.deliveryZone && (
                      <span className="text-sm text-muted-foreground">
                        {DELIVERY_ZONE_LABELS[order.deliveryZone] ?? order.deliveryZone}
                        {order.deliveryCharge > 0 &&
                          ` · Delivery ৳${order.deliveryCharge.toFixed(2)}`}
                      </span>
                    )}
                  </>
                )}
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment</span>
                  <span className="text-sm text-foreground">
                    {order.paymentMethod}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isAdmin && (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete order?"
          description={`This will permanently delete ${formatOrderId(order.orderNumber)}. This can't be undone.`}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  )
}
