"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import { useUpdateAdminCustomer } from "@/lib/api/use-admin-customers"
import { CUSTOMER_STATUSES, type Customer } from "@/lib/types/customer"

const STATUS_ITEMS = CUSTOMER_STATUSES.map((status) => ({
  label: status,
  value: status,
}))

export interface CustomerFormValues {
  name: string
  email: string
  phone: string
  status: Customer["status"]
}

export function CustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter()
  const isEdit = true
  const updateCustomer = useUpdateAdminCustomer()
  const saving = updateCustomer.isPending
  const [avatar, setAvatar] = useState<string | null>(customer?.avatar ?? null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      status: customer?.status ?? "Active",
    },
  })

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        payload: { name: data.name, phone: data.phone, status: data.status },
      })
      toast.success("Customer updated", { description: data.name })
      router.push("/admin/customers")
    } catch {
      toast.error("Failed to update customer")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.push("/admin/customers")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to customers
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Customer" : "Add Customer"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details for this customer."
            : "Fill in the details to create a new customer."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer details</CardTitle>
                <CardDescription>
                  Basic contact information for this customer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Photo</FieldLabel>
                    <SingleImageUpload
                      value={avatar}
                      onChange={setAvatar}
                      shape="circle"
                      size="size-20"
                      label="Upload photo"
                    />
                  </Field>

                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="e.g. James Smith"
                      aria-invalid={!!errors.name}
                      {...register("name", { required: "Name is required" })}
                    />
                    <FieldError errors={[errors.name]} />
                  </Field>

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. james@example.com"
                      aria-invalid={!!errors.email}
                      {...register("email", {
                        required: "Email is required",
                      })}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>

                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 555 1234"
                      aria-invalid={!!errors.phone}
                      {...register("phone")}
                    />
                    <FieldError errors={[errors.phone]} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account status</CardTitle>
                <CardDescription>
                  Control whether this customer can sign in and order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      value={watch("status")}
                      onValueChange={(value) =>
                        value &&
                        setValue("status", value as Customer["status"])
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {STATUS_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  {isEdit && (
                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {customer.ordersCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          ${customer.totalSpent.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total spent
                        </p>
                      </div>
                    </div>
                  )}
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/customers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? "Save changes" : "Create customer"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
