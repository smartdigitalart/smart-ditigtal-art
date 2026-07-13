import { notFound } from "next/navigation"

import { BrandForm } from "@/components/brands/brand-form"
import { getBrandByIdAction } from "@/app/admin/(protected)/brands/actions"

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brand = await getBrandByIdAction(id)

  if (!brand) {
    notFound()
  }

  return <BrandForm brand={brand} />
}
