import type { SupabaseClient } from "@supabase/supabase-js"

export interface CategoryNode {
  id: string
  name: string
  slug: string
  parentId: string | null
}

export async function getCategoryIdsByRootName(
  supabase: SupabaseClient,
  rootName: string
): Promise<string[]> {
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, parent_id")

  const rows = (categories ?? []) as {
    id: string
    name: string
    parent_id: string | null
  }[]

  const root = rows.find(
    (c) => c.parent_id === null && c.name.toLowerCase() === rootName.toLowerCase()
  )
  if (!root) return []

  const ids = [root.id]
  const collectChildren = (parentId: string) => {
    for (const row of rows) {
      if (row.parent_id === parentId) {
        ids.push(row.id)
        collectChildren(row.id)
      }
    }
  }
  collectChildren(root.id)

  return ids
}

export function getDescendantCategoryIds(categories: CategoryNode[], rootId: string): string[] {
  const ids = [rootId]
  const collectChildren = (parentId: string) => {
    for (const row of categories) {
      if (row.parentId === parentId) {
        ids.push(row.id)
        collectChildren(row.id)
      }
    }
  }
  collectChildren(rootId)
  return ids
}
