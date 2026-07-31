"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  BanknoteIcon,
  DownloadIcon,
  EyeIcon,
  PackageIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"

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
import { DateRangeFilter } from "@/components/data-table/date-range-filter"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/data-table/data-table-row-actions"
import { useAdminOrders, useUpdateOrderStatus } from "@/lib/api/use-admin-orders"
import { ORDER_STATUS_STYLES, type Order, type OrderStatus } from "@/lib/types/order"
import { formatOrderId } from "@/lib/orders/format-order-id"
import { exportOrdersToCsv } from "@/lib/orders/export-orders-csv"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Refunded", value: "Refunded" },
]

const BULK_STATUS_OPTIONS: { label: string; value: OrderStatus; icon: React.ReactNode }[] = [
  { label: "Pending", value: "Pending", icon: <ClockIcon className="text-chart-3" /> },
  { label: "Processing", value: "Processing", icon: <RefreshCcwIcon className="text-chart-1" /> },
  { label: "Completed", value: "Completed", icon: <CheckCircle2Icon className="text-chart-2" /> },
  { label: "Cancelled", value: "Cancelled", icon: <XCircleIcon className="text-destructive" /> },
  { label: "Refunded", value: "Refunded", icon: <RotateCcwIcon className="text-muted-foreground" /> },
]

const DELIVERY_ZONE_LABELS: Record<string, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
}

const STALE_PENDING_DAYS = 2

function daysSince(dateString: string): number {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000)
}

export default function OrdersPage() {
  const router = useRouter()
  const { data, isLoading: loading } = useAdminOrders()
  const updateStatus = useUpdateOrderStatus()
  const orders = data?.items ?? []
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false
      if (dateRange?.from) {
        const createdAt = new Date(order.createdAt)
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        const to = new Date(dateRange.to ?? dateRange.from)
        to.setHours(23, 59, 59, 999)
        if (createdAt < from || createdAt > to) return false
      }
      return true
    })
  }, [orders, status, dateRange])

  const hasActiveFilters = status !== "all" || search !== "" || !!dateRange?.from

  const resetFilters = () => {
    setStatus("all")
    setSearch("")
    setDateRange(undefined)
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
              <span className="font-medium text-foreground group-hover:text-primary">
                {formatOrderId(row.original.orderNumber)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {new Date(row.original.createdAt).toLocaleDateString()}
                {row.original.status === "Pending" &&
                  daysSince(row.original.createdAt) >= STALE_PENDING_DAYS && (
                    <span
                      className="flex items-center gap-0.5 text-chart-4"
                      title={`Pending for ${daysSince(row.original.createdAt)} days`}
                    >
                      <TriangleAlertIcon className="size-3" />
                      {daysSince(row.original.createdAt)}d
                    </span>
                  )}
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
            <span className="text-sm text-foreground group-hover:text-primary">
              {row.original.customerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.customerEmail}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: "customerPhone",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.customerPhone || "—"}
          </span>
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
        accessorKey: "deliveryZone",
        header: "Delivery",
        cell: ({ row }) =>
          row.original.deliveryZone ? (
            <span className="text-sm text-muted-foreground">
              {DELIVERY_ZONE_LABELS[row.original.deliveryZone] ??
                row.original.deliveryZone}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
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
            className={`border-transparent ${ORDER_STATUS_STYLES[row.original.status]}`}
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
            {
              label: "Set status",
              icon: <RefreshCcwIcon />,
              items: BULK_STATUS_OPTIONS.map((option) => ({
                label: option.label,
                icon: option.icon,
                active: row.original.status === option.value,
                onClick: () => {
                  updateStatus.mutate(
                    { id: row.original.id, status: option.value },
                    {
                      onSuccess: () =>
                        toast.success(
                          `${formatOrderId(row.original.orderNumber)} marked as ${option.value}`
                        ),
                      onError: () =>
                        toast.error("Failed to update order status"),
                    }
                  )
                },
              })),
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router, updateStatus]
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
          <>
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
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={filtered.length === 0}
            onClick={() =>
              exportOrdersToCsv(
                selectedCount > 0
                  ? selectedIndexes
                      .map((index) => filtered[Number(index)])
                      .filter((order): order is Order => !!order)
                  : filtered
              )
            }
          >
            <DownloadIcon data-icon="inline-start" />
            Export{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </Button>
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
