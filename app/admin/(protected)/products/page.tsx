"use client"

import { useMemo, useState } from "react"
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
import { useAdminProducts, useDeleteAdminProduct } from "@/lib/api/use-admin-products"
import { useAdminBrands } from "@/lib/api/use-admin-brands"
import { useAdminCategories } from "@/lib/api/use-admin-categories"
import type { Product } from "@/lib/types/product"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Draft", value: "DRAFT" },
  { label: "Out of stock", value: "OUT_OF_STOCK" },
]

const STATUS_STYLES: Record<Product["status"], string> = {
  ACTIVE: "bg-chart-2/10 text-chart-2",
  DRAFT: "bg-muted text-muted-foreground",
  OUT_OF_STOCK: "bg-destructive/10 text-destructive",
}

export default function ProductsPage() {
  const router = useRouter()
  const { data: productsData, isLoading: loading } = useAdminProducts()
  const { data: categoriesData } = useAdminCategories()
  const { data: brandsData } = useAdminBrands()
  const deleteProduct = useDeleteAdminProduct()
  const products = productsData?.items ?? []
  const categories = categoriesData?.items ?? []
  const brands = brandsData?.items ?? []
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [brand, setBrand] = useState("all")
  const [status, setStatus] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands])

  const CATEGORY_ITEMS = useMemo(
    () => [
      { label: "All Categories", value: "all" },
      ...categories.map((c) => ({ label: c.name, value: c.id })),
    ],
    [categories]
  )
  const BRAND_ITEMS = useMemo(
    () => [
      { label: "All Brands", value: "all" },
      ...brands.map((b) => ({ label: b.name, value: b.id })),
    ],
    [brands]
  )

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (category !== "all" && product.categoryId !== category) return false
      if (brand !== "all" && product.brandId !== brand) return false
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
    const idsToRemove = selectedIndexes
      .map((index) => filtered[Number(index)]?.id)
      .filter((id): id is string => !!id)
    void Promise.all(idsToRemove.map((id) => deleteProduct.mutateAsync(id)))
    toast.error(
      `Deleted ${selectedCount} product${selectedCount > 1 ? "s" : ""}`
    )
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: products.length,
      categories: new Set(products.map((p) => p.categoryId)).size,
      brands: new Set(products.map((p) => p.brandId)).size,
      outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
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
        accessorKey: "categoryId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => {
          const categoryName = categoryById.get(row.original.categoryId)?.name

          if (!categoryName) {
            return <span className="text-sm text-muted-foreground">—</span>
          }

          return (
            <Link
              href={`/admin/categories/${row.original.categoryId}/edit`}
              className="text-sm font-medium text-foreground hover:text-secondary"
            >
              {categoryName}
            </Link>
          )
        },
      },
      {
        accessorKey: "brandId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => {
          const brandName = brandById.get(row.original.brandId)?.name

          if (!brandName) {
            return <span className="text-sm text-muted-foreground">—</span>
          }

          return (
            <Link
              href={`/admin/brands/${row.original.brandId}/edit`}
              className="text-sm font-medium text-foreground hover:text-secondary"
            >
              {brandName}
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
              onClick: () => {
                void deleteProduct.mutateAsync(row.original.id)
                toast.error(`Deleted ${row.original.name}`)
              },
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router, categoryById, brandById, deleteProduct]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Products
        </h1>
        <Button asChild>
          <Link href="/admin/products/add">
            <PlusIcon data-icon="inline-start" />
            Add Product
          </Link>
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
