"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, MailIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/hooks/useAuth"
import { updateOwnProfileAction } from "@/app/(store)/profile/actions"

interface ProfileFormValues {
  name: string
  phone: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, isLoading, refreshUser } = useAuth()

  const { register, handleSubmit, reset, formState } = useForm<ProfileFormValues>({
    defaultValues: { name: "", phone: "" },
  })

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name ?? "" , phone: "" })
    }
  }, [profile, reset])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin?redirect=/profile")
    }
  }, [isLoading, isAuthenticated, router])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateOwnProfileAction(data)
      await refreshUser()
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to update profile")
    }
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  const initials = (profile?.name || user?.email || "U").slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-12">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold text-foreground">Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Update your name and phone number.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="email" value={user?.email ?? ""} disabled />
                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input id="name" placeholder="Your name" {...register("name")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                <Input id="phone" type="tel" placeholder="Your phone" {...register("phone")} />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
