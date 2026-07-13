"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BanIcon,
  BanknoteIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  ShieldOffIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  useAdminCustomers,
  useUpdateAdminCustomer,
  useUpdateCustomerRole,
} from "@/lib/api/use-admin-customers"
import type { Customer } from "@/lib/types/customer"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Blocked", value: "Blocked" },
]

const STATUS_STYLES: Record<Customer["status"], string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Blocked: "bg-destructive/10 text-destructive",
}

export default function CustomersPage() {
  const router = useRouter()
  const { data, isLoading: loading } = useAdminCustomers()
  const updateCustomer = useUpdateAdminCustomer()
  const updateCustomerRole = useUpdateCustomerRole()
  const customers = data?.items ?? []
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      if (status !== "all" && customer.status !== status) return false
      return true
    })
  }, [customers, status])

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
    toast.error(
      "Customer accounts can't be deleted here — manage them from Supabase Auth."
    )
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "Active").length,
      blocked: customers.filter((c) => c.status === "Blocked").length,
      revenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    }),
    [customers]
  )

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      createSelectColumn<Customer>(),
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/customers/${row.original.id}/edit`}
            className="group flex items-center gap-3"
          >
            <Avatar>
              {row.original.avatar && (
                <AvatarImage src={row.original.avatar} alt={row.original.name} />
              )}
              <AvatarFallback>
                {row.original.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-secondary">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "ordersCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Orders" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.ordersCount}
          </span>
        ),
      },
      {
        accessorKey: "totalSpent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Spent" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            ৳{row.original.totalSpent.toFixed(2)}
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
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) =>
          row.original.role === "admin" ? (
            <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
              Admin
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Customer</span>
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
                router.push(`/admin/customers/${row.original.id}/edit`),
            },
            {
              label:
                row.original.status === "Blocked" ? "Unblock" : "Block",
              icon: <BanIcon />,
              onClick: () => {
                void updateCustomer.mutateAsync({
                  id: row.original.id,
                  payload: {
                    name: row.original.name,
                    phone: row.original.phone,
                    status:
                      row.original.status === "Blocked" ? "Active" : "Blocked",
                  },
                })
              },
            },
            row.original.role === "admin"
              ? {
                  label: "Remove Admin",
                  icon: <ShieldOffIcon />,
                  destructive: true,
                  separatorBefore: true,
                  confirm: {
                    title: "Remove admin access?",
                    description: `${row.original.name} will lose access to the admin dashboard and revert to a regular customer.`,
                    confirmLabel: "Remove admin",
                  },
                  onClick: () => {
                    void updateCustomerRole
                      .mutateAsync({ id: row.original.id, role: "customer" })
                      .then(() =>
                        toast.success(`${row.original.name} is no longer an admin`)
                      )
                  },
                }
              : {
                  label: "Make Admin",
                  icon: <ShieldIcon />,
                  separatorBefore: true,
                  confirm: {
                    title: "Grant admin access?",
                    description: `${row.original.name} will be able to sign in to the admin dashboard and manage products, orders, and other customers.`,
                    confirmLabel: "Make admin",
                  },
                  onClick: () => {
                    void updateCustomerRole
                      .mutateAsync({ id: row.original.id, role: "admin" })
                      .then(() => toast.success(`${row.original.name} is now an admin`))
                  },
                },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router, updateCustomer, updateCustomerRole]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Customers
        </h1>
        <Button asChild>
          <Link href="/admin/customers/add">
            <PlusIcon data-icon="inline-start" />
            Add Customer
          </Link>
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Customers"
          value={stats.total}
          icon={<UsersIcon />}
          color="chart-1"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<UserIcon />}
          color="chart-2"
          loading={loading}
        />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          icon={<BanIcon />}
          color="chart-4"
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={`৳${stats.revenue.toFixed(2)}`}
          icon={<BanknoteIcon />}
          color="chart-5"
          loading={loading}
        />
      </StatCardGrid>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
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
