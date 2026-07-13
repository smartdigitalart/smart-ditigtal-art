import { Fragment } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface DataTableRowAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  separatorBefore?: boolean
}

export function DataTableRowActions({
  actions,
}: {
  actions: DataTableRowAction[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label="Open row menu"
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          {actions.map((action, index) => (
            <Fragment key={action.label}>
              {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.destructive ? "destructive" : "default"}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
