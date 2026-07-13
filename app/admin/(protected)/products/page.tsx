"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AwardIcon,
  EyeIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  TagsIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard, StatCardGrid } from "@/components/stat-card"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/data-table/data-table-row-actions"
import {
  CATEGORIES,
  BRANDS,
  generateProducts,
  type Product,
} from "@/lib/mock-products"
import { generateBrands } from "@/lib/mock-brands"
import { generateCategories } from "@/lib/mock-categories"

const CATEGORY_ITEMS = [
  { label: "All Categories", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]
const BRAND_ITEMS = [
  { label: "All Brands", value: "all" },
  ...BRANDS.map((b) => ({ label: b, value: b })),
]
const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Out of stock", value: "Out of stock" },
]

const STATUS_STYLES: Record<Product["status"], string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Draft: "bg-muted text-muted-foreground",
  "Out of stock": "bg-destructive/10 text-destructive",
}

const BRAND_ID_BY_NAME = new Map(
  generateBrands(24).map((brand) => [brand.name, brand.id])
)
const CATEGORY_ID_BY_NAME = new Map(
  generateCategories(24).map((category) => [category.name, category.id])
)

export default function ProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [brand, setBrand] = useState("all")
  const [status, setStatus] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(generateProducts(48))
      setLoading(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (category !== "all" && product.category !== category) return false
      if (brand !== "all" && product.brand !== brand) return false
      if (status !== "all" && product.status !== status) return false
      return true
    })
  }, [products, category, brand, status])

  const hasActiveFilters =
    category !== "all" || brand !== "all" || status !== "all" || search !== ""

  const resetFilters = () => {
    setCategory("all")
    setBrand("all")
    setStatus("all")
    setSearch("")
  }

  const selectedIndexes = useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]),
    [rowSelection]
  )
  const selectedCount = selectedIndexes.length

  const handleBulkDelete = () => {
    const idsToRemove = new Set(
      selectedIndexes.map((index) => filtered[Number(index)]?.id)
    )
    setProducts((prev) => prev.filter((product) => !idsToRemove.has(product.id)))
    toast.error(
      `Deleted ${selectedCount} product${selectedCount > 1 ? "s" : ""}`
    )
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: products.length,
      categories: new Set(products.map((p) => p.category)).size,
      brands: new Set(products.map((p) => p.brand)).size,
      outOfStock: products.filter((p) => p.status === "Out of stock").length,
    }),
    [products]
  )

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      createSelectColumn<Product>(),
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/products/${row.original.id}/edit`}
            className="group flex items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <PackageIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-secondary">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.sku}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => {
          const categoryId = CATEGORY_ID_BY_NAME.get(row.original.category)

          if (!categoryId) {
            return (
              <span className="text-sm text-foreground">
                {row.original.category}
              </span>
            )
          }

          return (
            <Link
              href={`/admin/categories/${categoryId}/edit`}
              className="text-sm font-medium text-foreground hover:text-secondary"
            >
              {row.original.category}
            </Link>
          )
        },
      },
      {
        accessorKey: "brand",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => {
          const brandId = BRAND_ID_BY_NAME.get(row.original.brand)

          if (!brandId) {
            return (
              <span className="text-sm text-foreground">
                {row.original.brand}
              </span>
            )
          }

          return (
            <Link
              href={`/admin/brands/${brandId}/edit`}
              className="text-sm font-medium text-foreground hover:text-secondary"
            >
              {row.original.brand}
            </Link>
          )
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            ${row.original.price.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`border-transparent ${STATUS_STYLES[row.original.status]}`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => toast.info(`Viewing ${row.original.name}`),
            },
            {
              label: "Edit",
              icon: <PencilIcon />,
              onClick: () =>
                router.push(`/admin/products/${row.original.id}/edit`),
            },
            {
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              onClick: () => toast.error(`Deleted ${row.original.name}`),
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Products
        </h1>
        <Button render={<Link href="/admin/products/add" />}>
          <PlusIcon data-icon="inline-start" />
          Add Product
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Products"
          value={stats.total}
          icon={<PackageIcon />}
          color="chart-1"
          loading={loading}
        />
        <StatCard
          label="Categories"
          value={stats.categories}
          icon={<TagsIcon />}
          color="chart-3"
          loading={loading}
        />
        <StatCard
          label="Brands"
          value={stats.brands}
          icon={<AwardIcon />}
          color="chart-5"
          loading={loading}
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          icon={<TriangleAlertIcon />}
          color="chart-4"
          loading={loading}
        />
      </StatCardGrid>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products, brands..."
        showReset={hasActiveFilters}
        onReset={resetFilters}
        bulkActions={
          selectedCount > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2Icon data-icon="inline-start" />
              Delete ({selectedCount})
            </Button>
          )
        }
        filters={
          <>
            <Select
              items={CATEGORY_ITEMS}
              value={category}
              onValueChange={(value) => setCategory(value ?? "all")}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CATEGORY_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              items={BRAND_ITEMS}
              value={brand}
              onValueChange={(value) => setBrand(value ?? "all")}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {BRAND_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setStatus(value ?? "all")}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
