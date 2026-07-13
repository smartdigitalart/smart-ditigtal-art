"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  CameraIcon,
  KeyRoundIcon,
  Loader2,
  MailIcon,
  SaveIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
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

interface ProfileForm {
  name: string
  phone: string
  whatsapp: string
}

export default function AdminProfilePage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
    },
  })

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (_data: ProfileForm) => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("Profile updated")
    } finally {
      setSaving(false)
    }
  }

  const initials = "AD"

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>
            <ShieldCheckIcon data-icon="inline-start" />
            Admin account
          </Badge>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal account details for the admin panel.
          </p>
        </div>
        <Button type="submit" form="profile-form" disabled={saving}>
          {saving ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save changes
        </Button>
      </div>

      <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5 text-muted-foreground" />
              Personal details
            </CardTitle>
            <CardDescription>
              This profile belongs to your login account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-6 md:grid-cols-[auto_1fr_1fr]">
                <div className="flex flex-col gap-2">
                  <FieldLabel>Profile photo</FieldLabel>
                  <div className="relative w-28">
                    <Avatar className="size-28 rounded-lg">
                      <AvatarImage
                        src={avatarPreview ?? undefined}
                        className="rounded-lg object-cover"
                      />
                      <AvatarFallback className="rounded-lg text-2xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar"
                      className="absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background hover:bg-primary/90"
                    >
                      <CameraIcon className="size-3.5" />
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shown in the account menu and internal activity.
                  </p>
                </div>

                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="e.g. Ayesha Rahman"
                    aria-invalid={!!errors.name}
                    {...register("name", { required: "Name is required" })}
                  />
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      disabled
                    />
                    <InputGroupAddon>
                      <MailIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="phone">Contact number</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>🇧🇩 +880</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      aria-invalid={!!errors.phone}
                      {...register("phone")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.phone]} />
                </Field>

                <Field data-invalid={!!errors.whatsapp}>
                  <FieldLabel htmlFor="whatsapp">WhatsApp number</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>🇧🇩 +880</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="whatsapp"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      aria-invalid={!!errors.whatsapp}
                      {...register("whatsapp")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.whatsapp]} />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end border-t pt-4">
          <Button variant="outline" render={<Link href="/admin/profile/change-password" />}>
            <KeyRoundIcon data-icon="inline-start" />
            Change password
          </Button>
        </CardFooter>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" form="profile-form" disabled={saving}>
          {saving ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  )
}
