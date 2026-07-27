import Image from "next/image"
import { PackageIcon } from "lucide-react"

export interface FeaturedProduct {
  id: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
}

export function ProductCard({ product }: { product: FeaturedProduct }) {
  const hasSale = product.salePrice != null && product.salePrice < product.price

  return (
    <div className="group flex flex-col gap-3">
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
      <div className="flex flex-col gap-1.5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {hasSale ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.price.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-foreground">
                ৳{product.salePrice!.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground">
              ৳{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
