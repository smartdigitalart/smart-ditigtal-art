import { notFound } from "next/navigation"

import { CategoryForm } from "@/components/categories/category-form"
import { getCategoryById } from "@/lib/mock-categories"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = getCategoryById(id)

  if (!category) {
    notFound()
  }

  return <CategoryForm category={category} />
}
