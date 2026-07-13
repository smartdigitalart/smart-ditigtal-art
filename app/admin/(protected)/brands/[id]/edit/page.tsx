import { notFound } from "next/navigation"

import { BrandForm } from "@/components/brands/brand-form"
import { getBrandById } from "@/lib/mock-brands"

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brand = getBrandById(id)

  if (!brand) {
    notFound()
  }

  return <BrandForm brand={brand} />
}
