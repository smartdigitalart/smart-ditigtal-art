"use client"

import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PackageIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCartStore, cartItemCount, cartSubtotal } from "@/lib/store/cart-store"

export function CartSheet() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const setOpen = useCartStore((state) => state.setOpen)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const itemCount = cartItemCount(items)
  const subtotal = cartSubtotal(items)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
              <Button variant="outline" asChild>
                <Link href="/">Continue shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex flex-col divide-y divide-border">
                {items.map((item) => {
                  const unitPrice = item.salePrice ?? item.price
                  return (
                    <div
                      key={`${item.productId}:${item.variantId ?? ""}`}
                      className="flex gap-3 py-4"
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
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variantId)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon className="size-4" />
                          </button>
                        </div>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ৳{unitPrice.toFixed(2)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              setQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon />
                          </Button>
                          <span className="w-5 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              setQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <SheetFooter className="border-t border-border">
              <div className="flex items-center justify-between text-base font-semibold text-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">৳{subtotal.toFixed(2)}</span>
              </div>
              <SheetClose asChild>
                <Button size="lg" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
