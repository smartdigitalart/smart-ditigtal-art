"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/hooks/useAuth"
import { changeMyPasswordAction } from "@/app/(store)/profile/security/actions"

interface ChangePasswordForm {
  newPassword: string
  confirmPassword: string
}

export default function SecurityPage() {
  const { user } = useAuth()
  const hasPassword =
    user?.app_metadata?.providers?.includes("email") ??
    user?.identities?.some((identity) => identity.provider === "email") ??
    true

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await changeMyPasswordAction({ newPassword: data.newPassword })
      toast.success("Password updated")
      reset()
    } catch {
      toast.error("Failed to update password")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage how you sign in to your account.
        </p>
      </div>

      {!hasPassword ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              You signed in with Google, so there&apos;s no password to
              manage here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Choose a strong password you haven&apos;t used before.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!errors.newPassword}>
                  <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    aria-invalid={!!errors.newPassword}
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <FieldError errors={[errors.newPassword]} />
                </Field>

                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword", {
                      required: "Please confirm your new password",
                      validate: (value) =>
                        value === watch("newPassword") ||
                        "Passwords do not match",
                    })}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Update password
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
