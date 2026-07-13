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
  StarIcon,
  Trash2Icon,
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
import { useAdminBrands, useDeleteAdminBrand } from "@/lib/api/use-admin-brands"
import type { Brand } from "@/lib/types/brand"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]
const FEATURED_ITEMS = [
  { label: "All Brands", value: "all" },
  { label: "Featured only", value: "featured" },
]

const STATUS_STYLES: Record<Brand["status"], string> = {
  ACTIVE: "bg-chart-2/10 text-chart-2",
  INACTIVE: "bg-muted text-muted-foreground",
}

export default function BrandsPage() {
  const router = useRouter()
  const { data, isLoading: loading } = useAdminBrands()
  const deleteBrand = useDeleteAdminBrand()
  const brands = data?.items ?? []
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filtered = useMemo(() => {
    return brands.filter((brand) => {
      if (status !== "all" && brand.status !== status) return false
      if (featuredFilter === "featured" && !brand.featured) return false
      return true
    })
  }, [brands, status, featuredFilter])

  const hasActiveFilters =
    status !== "all" || featuredFilter !== "all" || search !== ""

  const resetFilters = () => {
    setStatus("all")
    setFeaturedFilter("all")
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
    void Promise.all(idsToRemove.map((id) => deleteBrand.mutateAsync(id)))
    toast.error(`Deleted ${selectedCount} brand${selectedCount > 1 ? "s" : ""}`)
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: brands.length,
      active: brands.filter((b) => b.status === "ACTIVE").length,
      featured: brands.filter((b) => b.featured).length,
      products: brands.reduce((sum, b) => sum + b.productCount, 0),
    }),
    [brands]
  )

  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      createSelectColumn<Brand>(),
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/brands/${row.original.id}/edit`}
            className="group flex items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <AwardIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-secondary">
                {row.original.name}
                {row.original.featured && (
                  <StarIcon className="size-3.5 fill-chart-3 text-chart-3" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                /{row.original.slug}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "productCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Products" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.productCount}
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
                router.push(`/admin/brands/${row.original.id}/edit`),
            },
            {
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              onClick: () => {
                void deleteBrand.mutateAsync(row.original.id)
                toast.error(`Deleted ${row.original.name}`)
              },
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router, deleteBrand]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Brands
        </h1>
        <Button asChild>
          <Link href="/admin/brands/add">
            <PlusIcon data-icon="inline-start" />
            Add Brand
          </Link>
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Brands"
          value={stats.total}
          icon={<AwardIcon />}
          color="chart-1"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<AwardIcon />}
          color="chart-2"
          loading={loading}
        />
        <StatCard
          label="Featured"
          value={stats.featured}
          icon={<StarIcon />}
          color="chart-3"
          loading={loading}
        />
        <StatCard
          label="Total Products"
          value={stats.products}
          icon={<PackageIcon />}
          color="chart-5"
          loading={loading}
        />
      </StatCardGrid>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brands..."
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
              value={featuredFilter}
              onValueChange={(value) => setFeaturedFilter(value ?? "all")}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {FEATURED_ITEMS.map((item) => (
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
