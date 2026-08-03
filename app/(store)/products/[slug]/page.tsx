import Link from "next/link"
import { notFound } from "next/navigation"

import { getProductBySlugAction } from "@/app/admin/(protected)/products/actions"
import { getCategoryByIdAction } from "@/app/admin/(protected)/categories/actions"
import { getBrandByIdAction } from "@/app/admin/(protected)/brands/actions"
import { ProductDetailInteractive } from "@/app/(store)/_components/ProductDetailInteractive"
import { RelatedProducts } from "@/app/(store)/_components/RelatedProducts"
import { ExpandableDescription } from "@/app/(store)/_components/ExpandableDescription"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlugAction(slug)

  if (!product || product.status !== "ACTIVE") {
    notFound()
  }

  const [category, brand] = await Promise.all([
    getCategoryByIdAction(product.categoryId),
    getBrandByIdAction(product.brandId),
  ])

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
          <ProductDetailInteractive
            productId={product.id}
            productSlug={product.slug}
            name={product.name}
            brandName={brand?.name ?? null}
            shortDescription={product.shortDescription}
            price={product.price}
            salePrice={product.salePrice}
            images={product.images}
            inStock={product.inStock}
            variants={product.variants.map((variant) => ({ ...variant, id: variant.id! }))}
          />
        </div>

        {product.description && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Description
            </h2>
            <ExpandableDescription html={product.description} />
          </div>
        )}
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />
    </div>
  )
}
