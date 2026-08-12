import Link from "next/link"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CopyOrderId } from "@/app/(store)/checkout/success/CopyOrderId"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>
}) {
  const { orderNumber } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <CheckCircle2Icon className="size-14 text-green-500" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Order placed!
      </h1>
      <p className="text-muted-foreground">
        Thank you for your order. We&apos;ll contact you shortly to confirm
        delivery details.
      </p>
      {orderNumber && <CopyOrderId orderNumber={Number(orderNumber)} />}
      <Button asChild className="mt-2">
        <Link href="/">Continue shopping</Link>
      </Button>
    </div>
  )
}
