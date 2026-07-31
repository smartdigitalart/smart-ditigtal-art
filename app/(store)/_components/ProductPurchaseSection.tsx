"use client"

import { useState } from "react"
import { PackageCheckIcon, PackageXIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProductPurchasePanel } from "@/app/(store)/_components/ProductPurchasePanel"

export interface ProductVariantOption {
  id: string
  label: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
}

export function ProductPurchaseSection({
  productId,
  name,
  price,
  salePrice,
  image,
  inStock,
  variants,
  selectedVariantId: controlledVariantId,
  onSelectVariant,
}: {
  productId: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
  variants: ProductVariantOption[]
  selectedVariantId?: string | null
  onSelectVariant?: (variantId: string | null) => void
}) {
  const hasVariants = variants.length > 0
  const [uncontrolledVariantId, setUncontrolledVariantId] = useState<string | null>(
    hasVariants ? variants[0].id : null
  )
  const selectedVariantId = onSelectVariant ? controlledVariantId ?? null : uncontrolledVariantId
  const setSelectedVariantId = onSelectVariant ?? setUncontrolledVariantId
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? null

  const effectivePrice = selectedVariant ? selectedVariant.price : price
  const effectiveSalePrice = selectedVariant ? selectedVariant.salePrice : salePrice
  const effectiveImage = selectedVariant?.image ?? image
  const effectiveInStock = selectedVariant ? selectedVariant.inStock : inStock
  const hasSale = effectiveSalePrice != null && effectiveSalePrice < effectivePrice

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {hasSale ? (
          <>
            <span className="text-3xl font-bold text-foreground">
              ৳{effectiveSalePrice!.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              ৳{effectivePrice.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-foreground">
            ৳{effectivePrice.toFixed(2)}
          </span>
        )}
      </div>

      {hasVariants && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Options</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={!variant.inStock}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  variant.id === selectedVariantId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input text-foreground hover:border-primary"
                )}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Badge
        variant="outline"
        className={`w-fit border-transparent ${
          effectiveInStock
            ? "bg-chart-2/10 text-chart-2"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {effectiveInStock ? (
          <PackageCheckIcon data-icon="inline-start" />
        ) : (
          <PackageXIcon data-icon="inline-start" />
        )}
        {effectiveInStock ? "In Stock" : "Out of Stock"}
      </Badge>

      <ProductPurchasePanel
        productId={productId}
        name={name}
        price={effectivePrice}
        salePrice={effectiveSalePrice}
        image={effectiveImage}
        inStock={effectiveInStock}
        variantId={selectedVariant?.id ?? null}
        variantLabel={selectedVariant?.label ?? null}
      />
    </div>
  )
}
