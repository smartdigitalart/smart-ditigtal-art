import type { SupabaseClient } from "@supabase/supabase-js"
import { extractStoragePath } from "./storage-path"

const LIST_PAGE_SIZE = 1000

/**
 * Removes every file under `bucket/folder` whose path isn't in `activeUrls`.
 * Pass an empty `activeUrls` to wipe the folder entirely (e.g. on delete).
 * Returns the paths that were removed.
 */
export async function pruneStorageFolder(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
  activeUrls: (string | null | undefined)[]
): Promise<string[]> {
  const activePaths = new Set(
    activeUrls
      .filter((url): url is string => Boolean(url))
      .map((url) => extractStoragePath(bucket, url))
      .filter((path): path is string => Boolean(path))
  )

  const staleNames: string[] = []
  let offset = 0

  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: LIST_PAGE_SIZE, offset })
    if (error || !data || data.length === 0) break

    for (const file of data) {
      // Skip virtual "folder" placeholder entries (no id, no metadata).
      if (!file.id) continue
      const path = `${folder}/${file.name}`
      if (!activePaths.has(path)) staleNames.push(path)
    }

    if (data.length < LIST_PAGE_SIZE) break
    offset += LIST_PAGE_SIZE
  }

  if (staleNames.length > 0) {
    await supabase.storage.from(bucket).remove(staleNames)
  }

  return staleNames
}

/**
 * Lists the immediate subfolder names under `bucket/folder` (e.g. the
 * per-product folders under "products/"). Paginated to handle large buckets.
 */
export async function listSubfolders(
  supabase: SupabaseClient,
  bucket: string,
  folder: string
): Promise<string[]> {
  const names: string[] = []
  let offset = 0

  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: LIST_PAGE_SIZE, offset })
    if (error || !data || data.length === 0) break

    for (const entry of data) {
      // Real files have an id; folders are virtual entries without one.
      if (!entry.id) names.push(entry.name)
    }

    if (data.length < LIST_PAGE_SIZE) break
    offset += LIST_PAGE_SIZE
  }

  return names
}
