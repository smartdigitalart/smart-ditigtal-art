import Image from "next/image"
import Link from "next/link"
import { PackageIcon } from "lucide-react"

export interface FeaturedProduct {
  id: string
  slug: string
  name: string
  image: string | null
  displayPrice: number
  originalPrice: number | null
  isFromPrice: boolean
}

export function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PackageIcon className="size-8" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="truncate text-sm font-medium text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {product.isFromPrice && "From "}৳{product.displayPrice.toFixed(2)}
          </span>
          {product.originalPrice != null && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
