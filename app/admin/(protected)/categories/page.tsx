"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  FolderTreeIcon,
  LayersIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
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
import { generateCategories, type Category } from "@/lib/mock-categories"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
]
const PARENT_ITEMS = [
  { label: "All Categories", value: "all" },
  { label: "Top-level only", value: "top-level" },
  { label: "Sub-categories only", value: "sub" },
]

const STATUS_STYLES: Record<Category["status"], string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Inactive: "bg-muted text-muted-foreground",
}

export default function CategoriesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [parentFilter, setParentFilter] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setCategories(generateCategories(20))
      setLoading(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )

  const filtered = useMemo(() => {
    return categories.filter((category) => {
      if (status !== "all" && category.status !== status) return false
      if (parentFilter === "top-level" && category.parentId) return false
      if (parentFilter === "sub" && !category.parentId) return false
      return true
    })
  }, [categories, status, parentFilter])

  const hasActiveFilters =
    status !== "all" || parentFilter !== "all" || search !== ""

  const resetFilters = () => {
    setStatus("all")
    setParentFilter("all")
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
    setCategories((prev) => prev.filter((c) => !idsToRemove.has(c.id)))
    toast.error(
      `Deleted ${selectedCount} categor${selectedCount > 1 ? "ies" : "y"}`
    )
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.status === "Active").length,
      topLevel: categories.filter((c) => !c.parentId).length,
      products: categories.reduce((sum, c) => sum + c.productCount, 0),
    }),
    [categories]
  )

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      createSelectColumn<Category>(),
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/categories/${row.original.id}/edit`}
            className="group flex items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FolderTreeIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-secondary">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                /{row.original.slug}
              </span>
            </div>
          </Link>
        ),
      },
      {
        id: "parent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Parent" />
        ),
        accessorFn: (row) =>
          row.parentId ? categoryById.get(row.parentId)?.name ?? "" : "",
        cell: ({ row }) =>
          row.original.parentId ? (
            <span className="text-sm text-foreground">
              {categoryById.get(row.original.parentId)?.name ?? "—"}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Top-level
            </span>
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
                router.push(`/admin/categories/${row.original.id}/edit`),
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
    [router, categoryById]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Categories
        </h1>
        <Button render={<Link href="/admin/categories/add" />}>
          <PlusIcon data-icon="inline-start" />
          Add Category
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Categories"
          value={stats.total}
          icon={<FolderTreeIcon />}
          color="chart-1"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<LayersIcon />}
          color="chart-2"
          loading={loading}
        />
        <StatCard
          label="Top-level"
          value={stats.topLevel}
          icon={<FolderTreeIcon />}
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
        searchPlaceholder="Search categories..."
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
              items={PARENT_ITEMS}
              value={parentFilter}
              onValueChange={(value) => setParentFilter(value ?? "all")}
            >
              <SelectTrigger size="sm" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PARENT_ITEMS.map((item) => (
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
