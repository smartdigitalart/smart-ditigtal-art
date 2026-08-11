"use client"

import { useState } from "react"

import { ProductGallery } from "@/app/(store)/_components/ProductGallery"
import {
  ProductPurchaseSection,
  type ProductVariantOption,
} from "@/app/(store)/_components/ProductPurchaseSection"
import { AdminEditProductButton } from "@/components/products/admin-edit-product-button"

export function ProductDetailInteractive({
  productId,
  productSlug,
  name,
  brandName,
  shortDescription,
  price,
  salePrice,
  images,
  inStock,
  variants,
}: {
  productId: string
  productSlug: string
  name: string
  brandName: string | null
  shortDescription: string
  price: number
  salePrice: number | null
  images: { id: string; url: string }[]
  inStock: boolean
  variants: ProductVariantOption[]
}) {
  const hasVariants = variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? variants[0].id : null
  )
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? null

  const variantImages = variants
    .filter((variant) => variant.image)
    .map((variant) => ({ id: `variant-${variant.id}`, url: variant.image! }))
  const galleryImages = [...variantImages, ...images]

  const focusImageId = selectedVariant?.image
    ? `variant-${selectedVariant.id}`
    : (images[0]?.id ?? null)

  return (
    <>
      <div className="min-w-0">
        <ProductGallery
          images={galleryImages}
          name={name}
          focusImageId={focusImageId}
        />
      </div>

      <div className="min-w-0 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {brandName && (
              <p className="text-sm font-medium text-muted-foreground">
                {brandName}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {name}
            </h1>
          </div>
          <AdminEditProductButton productId={productId} productSlug={productSlug} />
        </div>

        {shortDescription && (
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: shortDescription }}
          />
        )}

        <ProductPurchaseSection
          productId={productId}
          name={name}
          price={price}
          salePrice={salePrice}
          image={images[0]?.url ?? null}
          inStock={inStock}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />
      </div>
    </>
  )
}
