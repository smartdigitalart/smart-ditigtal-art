import Link from "next/link"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <CheckCircle2Icon className="size-14 text-chart-2" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Order placed!
      </h1>
      <p className="text-muted-foreground">
        Thank you for your order. We&apos;ll contact you shortly to confirm
        delivery details.
      </p>
      {orderId && (
        <p className="text-sm text-muted-foreground">
          Order reference:{" "}
          <span className="font-mono text-foreground">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <Button asChild className="mt-2">
        <Link href="/">Continue shopping</Link>
      </Button>
    </div>
  )
}
