"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatOrderId } from "@/lib/orders/format-order-id"

export function CopyOrderId({ orderNumber }: { orderNumber: number }) {
  const [copied, setCopied] = useState(false)
  const formattedOrderId = formatOrderId(orderNumber)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOrderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied, silently ignore
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">Order ID:</span>
      <span className="font-mono text-sm text-foreground">
        {formattedOrderId}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => void handleCopy()}
        aria-label="Copy order ID"
        className="text-muted-foreground hover:text-foreground"
      >
        {copied ? <CheckIcon className="text-chart-2" /> : <CopyIcon />}
      </Button>
    </div>
  )
}
