import { Suspense } from "react"

import { ProductForm } from "@/components/products/product-form"

export default function AddProductPage() {
  return (
    <Suspense>
      <ProductForm />
    </Suspense>
  )
}
