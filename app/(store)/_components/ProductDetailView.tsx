"use client"

import { useState } from "react"
import Image from "next/image"
import { PackageIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ProductDetailVariant {
  id: string
  label: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
}

export interface ProductDetailData {
  id: string
  name: string
  description: string
  images: { id: string; url: string }[]
  price: number
  salePrice: number | null
  inStock: boolean
  variants: ProductDetailVariant[]
}

export function ProductDetailView({ product }: { product: ProductDetailData }) {
  const hasVariants = product.variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null
  )
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null

  const displayImage = selectedVariant?.image ?? product.images[0]?.url ?? null
  const displayPrice = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : product.salePrice ?? product.price
  const originalPrice = selectedVariant
    ? selectedVariant.salePrice != null
      ? selectedVariant.price
      : null
    : product.salePrice != null
      ? product.price
      : null
  const inStock = selectedVariant ? selectedVariant.inStock : product.inStock

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PackageIcon className="size-12" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-foreground">
            ৳{displayPrice.toFixed(2)}
          </span>
          {originalPrice != null && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {hasVariants && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Options</span>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
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

        <span
          className={cn(
            "text-sm font-medium",
            inStock ? "text-chart-2" : "text-destructive"
          )}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>

        {product.description && (
          <div
            className="mt-2 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-foreground [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
      </div>
    </div>
  )
}
