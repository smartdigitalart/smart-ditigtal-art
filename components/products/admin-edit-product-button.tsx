"use client"

import Link from "next/link"
import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function AdminEditProductButton({ productId }: { productId: string }) {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return null
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link
        href={`/admin/products/${productId}/edit?returnTo=${encodeURIComponent(
          `/products/${productId}`
        )}`}
      >
        <PencilIcon data-icon="inline-start" />
        Edit product
      </Link>
    </Button>
  )
}
