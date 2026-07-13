import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const colorClasses = {
  "chart-1": "bg-chart-1/10 text-chart-1",
  "chart-2": "bg-chart-2/10 text-chart-2",
  "chart-3": "bg-chart-3/10 text-chart-3",
  "chart-4": "bg-chart-4/10 text-chart-4",
  "chart-5": "bg-chart-5/10 text-chart-5",
} as const

export type StatCardColor = keyof typeof colorClasses

export interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: StatCardColor
  loading?: boolean
}

export function StatCard({
  label,
  value,
  icon,
  color = "chart-1",
  loading,
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
          colorClasses[color]
        )}
      >
        {icon}
      </div>
    </div>
  )
}

export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>
  )
}
