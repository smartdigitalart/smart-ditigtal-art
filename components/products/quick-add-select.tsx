"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FieldLabel } from "@/components/ui/field"

export function QuickAddSelect({
  id,
  label,
  options,
  value,
  onValueChange,
  onAddOption,
  addLabel,
}: {
  id: string
  label: string
  options: string[]
  value: string
  onValueChange: (value: string) => void
  onAddOption: (value: string) => void
  addLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  const items = options.map((option) => ({ label: option, value: option }))

  const handleAdd = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAddOption(trimmed)
    onValueChange(trimmed)
    setDraft("")
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={addLabel}
                className="text-muted-foreground hover:text-primary"
              />
            }
          >
            <PlusIcon />
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <PopoverHeader>
              <PopoverTitle>{addLabel}</PopoverTitle>
            </PopoverHeader>
            <form
              className="mt-2 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                handleAdd()
              }}
            >
              <Input
                autoFocus
                placeholder="Name"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="h-8"
              />
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => next && onValueChange(next)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
