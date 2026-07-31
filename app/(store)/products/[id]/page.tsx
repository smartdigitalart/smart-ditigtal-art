import Link from "next/link"
import { notFound } from "next/navigation"
import { PackageCheckIcon, PackageXIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getProductByIdAction } from "@/app/admin/(protected)/products/actions"
import { getCategoryByIdAction } from "@/app/admin/(protected)/categories/actions"
import { getBrandByIdAction } from "@/app/admin/(protected)/brands/actions"
import { ProductGallery } from "@/app/(store)/_components/ProductGallery"
import { ProductPurchasePanel } from "@/app/(store)/_components/ProductPurchasePanel"
import { RelatedProducts } from "@/app/(store)/_components/RelatedProducts"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductByIdAction(id)

  if (!product || product.status !== "ACTIVE") {
    notFound()
  }

  const [category, brand] = await Promise.all([
    getCategoryByIdAction(product.categoryId),
    getBrandByIdAction(product.brandId),
  ])

  const hasSale = product.salePrice != null && product.salePrice < product.price

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="hover:text-foreground"
              >
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: image gallery */}
          <div>
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-5">
            <div>
              {brand && (
                <p className="text-sm font-medium text-muted-foreground">
                  {brand.name}
                </p>
              )}
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {hasSale ? (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    ৳{product.salePrice!.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  ৳{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <Badge
              variant="outline"
              className={`w-fit border-transparent ${
                product.inStock
                  ? "bg-chart-2/10 text-chart-2"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {product.inStock ? (
                <PackageCheckIcon data-icon="inline-start" />
              ) : (
                <PackageXIcon data-icon="inline-start" />
              )}
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>

            {product.shortDescription && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            <ProductPurchasePanel
              productId={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              image={product.images[0]?.url ?? null}
              inStock={product.inStock}
            />
          </div>
        </div>

        {product.description && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />
    </div>
  )
}
