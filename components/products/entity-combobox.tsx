"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export interface ComboboxOption {
  value: string
  label: string
}

export function EntityCombobox({
  items,
  selected,
  onSelect,
  placeholder,
  onAddNew,
  addLabel,
}: {
  items: ComboboxOption[]
  selected: ComboboxOption | null
  onSelect: (option: ComboboxOption | null) => void
  placeholder: string
  onAddNew: () => void
  addLabel: string
}) {
  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={onSelect}
      isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <div className="border-t border-border p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
            onClick={onAddNew}
          >
            <PlusIcon className="size-4" />
            {addLabel}
          </Button>
        </div>
      </ComboboxContent>
    </Combobox>
  )
}
