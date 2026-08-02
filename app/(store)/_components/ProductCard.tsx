import Image from "next/image"
import Link from "next/link"
import { PackageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FeaturedProduct {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
  hoverImage: string | null
  isFromPrice?: boolean
}

export function ProductCard({ product }: { product: FeaturedProduct }) {
  const hasSale = product.salePrice != null && product.salePrice < product.price

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={cn(
                "object-cover transition-all duration-500 ease-out group-hover:scale-105",
                product.hoverImage && "group-hover:opacity-0"
              )}
            />
            {product.hoverImage && (
              <Image
                src={product.hoverImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
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
              <span className="text-lg font-bold text-foreground">
                {product.isFromPrice && "From "}৳{product.salePrice!.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground">
              {product.isFromPrice && "From "}৳{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
