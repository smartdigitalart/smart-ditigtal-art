export interface CategoryNode {
  id: string
  name: string
  slug: string
  parentId: string | null
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
