"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SlidersHorizontalIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { CategoryNode } from "@/lib/store/categories"

export interface BrandOption {
  id: string
  name: string
  slug: string
}

interface ShopFiltersProps {
  categories: CategoryNode[]
  brands: BrandOption[]
  priceBounds: { min: number; max: number }
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function ShopFilters({ categories, brands, priceBounds }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .filter(Boolean)
  const selectedBrands = (searchParams.get("brand") ?? "").split(",").filter(Boolean)
  const inStockOnly = searchParams.get("stock") === "1"

  const minParam = searchParams.get("min")
  const maxParam = searchParams.get("max")
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minParam ? Number(minParam) : priceBounds.min,
    maxParam ? Number(maxParam) : priceBounds.max,
  ])

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    router.push(`/shop?${params.toString()}`, { scroll: false })
  }

  const handleCategoryToggle = (slug: string) => {
    updateParams((params) => {
      const next = toggleValue(selectedCategories, slug)
      if (next.length > 0) params.set("category", next.join(","))
      else params.delete("category")
    })
  }

  const handleBrandToggle = (slug: string) => {
    updateParams((params) => {
      const next = toggleValue(selectedBrands, slug)
      if (next.length > 0) params.set("brand", next.join(","))
      else params.delete("brand")
    })
  }

  const handleStockToggle = () => {
    updateParams((params) => {
      if (inStockOnly) params.delete("stock")
      else params.set("stock", "1")
    })
  }

  const handlePriceCommit = (value: number[]) => {
    const [min, max] = value
    updateParams((params) => {
      if (min <= priceBounds.min) params.delete("min")
      else params.set("min", String(min))
      if (max >= priceBounds.max) params.delete("max")
      else params.set("max", String(max))
    })
  }

  const handleClear = () => {
    const params = new URLSearchParams()
    const q = searchParams.get("q")
    if (q) params.set("q", q)
    router.push(`/shop?${params.toString()}`, { scroll: false })
    setPriceRange([priceBounds.min, priceBounds.max])
  }

  const roots = categories.filter((c) => c.parentId === null)
  const childrenOf = (parentId: string) => categories.filter((c) => c.parentId === parentId)

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    minParam !== null ||
    maxParam !== null

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Category</h3>
        <div className="space-y-2">
          {roots.map((root) => (
            <div key={root.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${root.slug}`}
                  checked={selectedCategories.includes(root.slug)}
                  onCheckedChange={() => handleCategoryToggle(root.slug)}
                />
                <Label htmlFor={`cat-${root.slug}`} className="text-sm font-normal">
                  {root.name}
                </Label>
              </div>
              {childrenOf(root.id).map((child) => (
                <div key={child.id} className="ml-6 flex items-center gap-2">
                  <Checkbox
                    id={`cat-${child.slug}`}
                    checked={selectedCategories.includes(child.slug)}
                    onCheckedChange={() => handleCategoryToggle(child.slug)}
                  />
                  <Label htmlFor={`cat-${child.slug}`} className="text-sm font-normal">
                    {child.name}
                  </Label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand.slug}`}
                checked={selectedBrands.includes(brand.slug)}
                onCheckedChange={() => handleBrandToggle(brand.slug)}
              />
              <Label htmlFor={`brand-${brand.slug}`} className="text-sm font-normal">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Price</h3>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          onValueCommit={handlePriceCommit}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>৳{priceRange[0].toFixed(0)}</span>
          <span>৳{priceRange[1].toFixed(0)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={handleStockToggle} />
        <Label htmlFor="in-stock" className="text-sm font-normal">
          In stock only
        </Label>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontalIcon />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle>Filters</SheetTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear all
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="px-4 pb-6">{filterContent}</div>
            <SheetClose asChild>
              <Button className="sticky bottom-0 m-4 mt-0">Show results</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          )}
        </div>
        {filterContent}
      </aside>
    </>
  )
}
