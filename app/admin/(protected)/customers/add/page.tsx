import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AddCustomerPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Customers sign up themselves</CardTitle>
          <CardDescription>
            Customer accounts are created through the storefront sign-up flow,
            not from the admin panel. Once someone signs up, they&apos;ll
            appear here automatically and you can edit their details or
            status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/customers">Back to customers</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
