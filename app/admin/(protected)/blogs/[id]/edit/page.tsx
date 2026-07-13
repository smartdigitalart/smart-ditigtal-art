import { notFound } from "next/navigation"

import { BlogForm } from "@/components/blogs/blog-form"
import { getBlogByIdAction } from "@/app/admin/(protected)/blogs/actions"

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const blog = await getBlogByIdAction(id)

  if (!blog) {
    notFound()
  }

  return <BlogForm blog={blog} />
}
