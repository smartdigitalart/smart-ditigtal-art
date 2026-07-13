"use server"

import { createClient } from "@/lib/supabase/server"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import type { Blog, BlogPayload } from "@/lib/types/blog"

function mapBlog(row: Record<string, unknown>): Blog {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    content: (row.content as string) ?? "",
    coverImage: (row.cover_image as string | null) ?? null,
    category: (row.category as string | null) ?? null,
    author: (row.author as string | null) ?? null,
    status: row.status as Blog["status"],
    views: Number(row.views ?? 0),
    publishedAt: (row.published_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function listBlogsAction(): Promise<Blog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapBlog)
}

export async function getBlogByIdAction(id: string): Promise<Blog | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return mapBlog(data)
}

export async function createBlogAction(payload: BlogPayload): Promise<Blog> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      id: payload.id,
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      cover_image: payload.coverImage,
      status: payload.status,
      published_at: payload.status === "Published" ? new Date().toISOString() : null,
    })
    .select()
    .single()
  if (error) throw error
  return mapBlog(data)
}

export async function updateBlogAction(
  id: string,
  payload: BlogPayload
): Promise<Blog> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      cover_image: payload.coverImage,
      status: payload.status,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return mapBlog(data)
}

export async function deleteBlogAction(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) throw error
}

export async function uploadBlogImageAction(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = await createClient()
  const blogId = formData.get("blogId") as string
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop() ?? "bin"
  const path = `blogs/${blogId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteBlogUploadAction(
  _blogId: string,
  url: string
): Promise<void> {
  const supabase = await createClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
