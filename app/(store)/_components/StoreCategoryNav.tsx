import Link from "next/link"
import { FlameIcon, SparklesIcon } from "lucide-react"

import { createClient } from "@/lib/supabase/server"

interface NavCategory {
  id: string
  name: string
  slug: string
}

async function getNavCategories(): Promise<NavCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("status", "ACTIVE")
    .is("parent_id", null)
    .order("name")

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
  }))
}

export async function StoreCategoryNav() {
  const categories = await getNavCategories()

  return (
    <nav className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop?collection=flash-deal"
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <FlameIcon className="text-accent" />
          Flash Deal
        </Link>
        <Link
          href="/shop?collection=new-arrival"
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <SparklesIcon className="text-accent" />
          New Arrival
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className="flex h-9 shrink-0 items-center px-4 text-sm font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
