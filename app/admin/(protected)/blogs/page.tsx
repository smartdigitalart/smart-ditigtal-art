"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  TagsIcon,
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
import { useAdminBlogs, useDeleteAdminBlog } from "@/lib/api/use-admin-blogs"
import { BLOG_STATUSES, type Blog } from "@/lib/types/blog"

const STATUS_ITEMS = [
  { label: "All Status", value: "all" },
  ...BLOG_STATUSES.map((s) => ({ label: s, value: s })),
]

const STATUS_STYLES: Record<Blog["status"], string> = {
  Published: "bg-chart-2/10 text-chart-2",
  Draft: "bg-muted text-muted-foreground",
  Scheduled: "bg-chart-4/10 text-chart-4",
}

export default function BlogsPage() {
  const router = useRouter()
  const { data, isLoading: loading } = useAdminBlogs()
  const deleteBlog = useDeleteAdminBlog()
  const posts = data?.items ?? []
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (status !== "all" && post.status !== status) return false
      return true
    })
  }, [posts, status])

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
    const idsToRemove = selectedIndexes
      .map((index) => filtered[Number(index)]?.id)
      .filter((id): id is string => !!id)
    void Promise.all(idsToRemove.map((id) => deleteBlog.mutateAsync(id)))
    toast.error(`Deleted ${selectedCount} post${selectedCount > 1 ? "s" : ""}`)
    setRowSelection({})
  }

  const stats = useMemo(
    () => ({
      total: posts.length,
      categories: new Set(posts.map((p) => p.category).filter(Boolean)).size,
      published: posts.filter((p) => p.status === "Published").length,
      drafts: posts.filter((p) => p.status === "Draft").length,
    }),
    [posts]
  )

  const columns = useMemo<ColumnDef<Blog>[]>(
    () => [
      createSelectColumn<Blog>(),
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Post" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/blogs/${row.original.id}/edit`}
            className="group flex items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileTextIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-secondary">
                {row.original.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.author ?? "—"}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "views",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Views" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.views.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "publishedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.publishedAt
              ? new Date(row.original.publishedAt).toLocaleDateString()
              : "—"}
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
              onClick: () => toast.info(`Viewing ${row.original.title}`),
            },
            {
              label: "Edit",
              icon: <PencilIcon />,
              onClick: () => router.push(`/admin/blogs/${row.original.id}/edit`),
            },
            {
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              onClick: () => {
                void deleteBlog.mutateAsync(row.original.id)
                toast.error(`Deleted ${row.original.title}`)
              },
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [router, deleteBlog]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Blogs
        </h1>
        <Button asChild>
          <Link href="/admin/blogs/add">
            <PlusIcon data-icon="inline-start" />
            Add Post
          </Link>
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          label="Total Posts"
          value={stats.total}
          icon={<FileTextIcon />}
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
          label="Published"
          value={stats.published}
          icon={<SendIcon />}
          color="chart-2"
          loading={loading}
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={<PencilIcon />}
          color="chart-4"
          loading={loading}
        />
      </StatCardGrid>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search posts, authors..."
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
