"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, MinusIcon, PackageIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { createOrderAction } from "@/app/(store)/checkout/actions"
import { DELIVERY_CHARGES, type DeliveryZone } from "@/lib/checkout/delivery"

export interface CheckoutLineItem {
  productId: string
  variantId: string | null
  variantLabel: string | null
  name: string
  price: number
  salePrice: number | null
  image: string | null
  quantity: number
}

export function CheckoutForm({
  items,
  onQuantityChange,
  onRemove,
  onOrderPlaced,
}: {
  items: CheckoutLineItem[]
  onQuantityChange: (productId: string, variantId: string | null, quantity: number) => void
  onRemove?: (productId: string, variantId: string | null) => void
  onOrderPlaced?: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka")
  const [submitting, setSubmitting] = useState(false)

  const subtotal = items.reduce(
    (sum, item) => sum + (item.salePrice ?? item.price) * item.quantity,
    0
  )
  const deliveryCharge = DELIVERY_CHARGES[deliveryZone]
  const total = subtotal + deliveryCharge

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in your name, phone, and address")
      return
    }

    setSubmitting(true)
    try {
      const { orderNumber } = await createOrderAction({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        name,
        phone,
        address,
        deliveryZone,
      })
      onOrderPlaced?.()
      router.push(`/checkout/success?orderNumber=${orderNumber}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      {/* Left: delivery details */}
      <div className="order-2 lg:order-1">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="address">Delivery address</FieldLabel>
            <Textarea
              id="address"
              placeholder="House, road, area, city"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Delivery location</FieldLabel>
            <RadioGroup
              value={deliveryZone}
              onValueChange={(value) => setDeliveryZone(value as DeliveryZone)}
              className="gap-3"
            >
              <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm has-[[data-checked]]:border-primary">
                <span className="flex items-center gap-2">
                  <RadioGroupItem value="inside_dhaka" id="inside_dhaka" />
                  Inside Dhaka
                </span>
                <span className="text-muted-foreground">
                  ৳{DELIVERY_CHARGES.inside_dhaka.toFixed(2)}
                </span>
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm has-[[data-checked]]:border-primary">
                <span className="flex items-center gap-2">
                  <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                  Outside Dhaka
                </span>
                <span className="text-muted-foreground">
                  ৳{DELIVERY_CHARGES.outside_dhaka.toFixed(2)}
                </span>
              </label>
            </RadioGroup>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || items.length === 0}
            className="mt-2"
          >
            {submitting && <Loader2 className="animate-spin" />}
            Place Order
          </Button>
        </FieldGroup>
      </div>

      {/* Right: order summary */}
      <div className="order-1 lg:order-2">
        <div className="rounded-lg border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Order Summary
          </h2>

          <div className="flex flex-col divide-y divide-border">
            {items.map((item) => {
              const unitPrice = item.salePrice ?? item.price
              return (
                <div
                  key={`${item.productId}:${item.variantId ?? ""}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <PackageIcon className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      ৳{unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onQuantityChange(item.productId, item.variantId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onQuantityChange(item.productId, item.variantId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.productId, item.variantId)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums text-foreground">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="tabular-nums text-foreground">
                ৳{deliveryCharge.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">৳{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </form>
  )
}
