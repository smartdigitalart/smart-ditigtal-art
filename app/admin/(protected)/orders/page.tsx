"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  BanknoteIcon,
  EyeIcon,
  PackageIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  Trash2Icon,
  XCircleIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatCard, StatCardGrid } from "@/components/stat-card"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/data-table/data-table-row-actions"
import { useAdminOrders, useUpdateOrderStatus } from "@/lib/api/use-admin-orders"
import { type Order, type OrderStatus } from "@/lib/types/order"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Refunded", value: "Refunded" },
]

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  Processing: "bg-chart-1/10 text-chart-1",
  Completed: "bg-chart-2/10 text-chart-2",
  Cancelled: "bg-destructive/10 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
}

const BULK_STATUS_OPTIONS: { label: string; value: OrderStatus; icon: React.ReactNode }[] = [
  { label: "Pending", value: "Pending", icon: <ClockIcon className="text-chart-3" /> },
  { label: "Processing", value: "Processing", icon: <RefreshCcwIcon className="text-chart-1" /> },
  { label: "Completed", value: "Completed", icon: <CheckCircle2Icon className="text-chart-2" /> },
  { label: "Cancelled", value: "Cancelled", icon: <XCircleIcon className="text-destructive" /> },
  { label: "Refunded", value: "Refunded", icon: <RotateCcwIcon className="text-muted-foreground" /> },
]

export default function OrdersPage() {
  const router = useRouter()
  const { data, isLoading: loading } = useAdminOrders()
  const updateStatus = useUpdateOrderStatus()
  const orders = data?.items ?? []
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false
      return true
    })
  }, [orders, status])

  const hasActiveFilters = status !== "all" || search !== ""

  const resetFilters = () => {
    setStatus("all")
    setSearch("")
  }

  const selectedIndexes = useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]),
    [rowSelection]
  )
  const selectedCount = selectedIndexes.length

  const handleBulkDelete = () => {
    toast.error("Orders can't be deleted here.")
    setRowSelection({})
  }

  const handleBulkStatusUpdate = (newStatus: OrderStatus) => {
    const idsToUpdate = selectedIndexes
      .map((index) => filtered[Number(index)]?.id)
      .filter((id): id is string => !!id)
    void Promise.all(
      idsToUpdate.map((id) => updateStatus.mutateAsync({ id, status: newStatus }))
    )
    toast.success(
      `Marked ${selectedCount} order${selectedCount > 1 ? "s" : ""} as ${newStatus}`
    )
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      revenue: orders
        .filter((o) => o.status !== "Cancelled" && o.status !== "Refunded")
        .reduce((sum, o) => sum + o.total, 0),
    }),
    [orders]
  )

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      createSelectColumn<Order>(),
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/orders/${row.original.id}`}
            className="group flex items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <PackageIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-secondary">
                {row.original.id}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(row.original.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/customers/${row.original.customerId}/edit`}
            className="group flex flex-col"
          >
            <span className="text-sm text-foreground group-hover:text-secondary">
              {row.original.customerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.customerEmail}
            </span>
          </Link>
        ),
      },
      {
        id: "items",
        header: "Items",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.items.length}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            ৳{row.original.total.toFixed(2)}
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
              onClick: () => router.push(`/admin/orders/${row.original.id}`),
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
          Orders
        </h1>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Orders"
          value={stats.total}
          icon={<PackageIcon />}
          color="chart-1"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<ClockIcon />}
          color="chart-3"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2Icon />}
          color="chart-2"
          loading={loading}
        />
        <StatCard
          label="Revenue"
          value={`৳${stats.revenue.toFixed(2)}`}
          icon={<BanknoteIcon />}
          color="chart-5"
          loading={loading}
        />
      </StatCardGrid>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search orders, customers..."
        showReset={hasActiveFilters}
        onReset={resetFilters}
        bulkActions={
          selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Set status
                    <ChevronDownIcon data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    {BULK_STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleBulkStatusUpdate(option.value)}
                      >
                        {option.icon}
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2Icon data-icon="inline-start" />
                Delete ({selectedCount})
              </Button>
            </div>
          )
        }
        filters={
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger size="sm" className="w-40">
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
