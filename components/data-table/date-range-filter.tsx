"use client"

import { CalendarIcon, XIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}) {
  const label = value?.from
    ? value.to && value.to.getTime() !== value.from.getTime()
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
      : format(value.from, "MMM d, yyyy")
    : "Date range"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-48 justify-start">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          defaultMonth={value?.from}
        />
        {value?.from && (
          <div className="flex justify-end border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
            >
              <XIcon data-icon="inline-start" />
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
