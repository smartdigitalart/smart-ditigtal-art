import { notFound } from "next/navigation"

import { CategoryForm } from "@/components/categories/category-form"
import { getCategoryByIdAction } from "@/app/admin/(protected)/categories/actions"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getCategoryByIdAction(id)

  if (!category) {
    notFound()
  }

  return <CategoryForm category={category} />
}
