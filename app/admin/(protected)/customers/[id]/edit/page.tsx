import { notFound } from "next/navigation"

import { CustomerForm } from "@/components/customers/customer-form"
import { getCustomerByIdAction } from "@/app/admin/(protected)/customers/actions"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomerByIdAction(id)

  if (!customer) {
    notFound()
  }

  return <CustomerForm customer={customer} />
}
