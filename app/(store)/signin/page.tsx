"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getErrorMessage } from "@/lib/api/error-message";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type AuthFormValues = z.infer<typeof authSchema>;

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, isAuthenticated, isLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(searchParams.get("redirect") || "/");
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      toast.error("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) {
      return;
    }

    setIsGoogleLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const response = await signUp({
          email: values.email.trim(),
          password: values.password,
        });

        toast.success(response.message);
        form.reset();
        setIsSignUp(false);
      } else {
        await signIn({
          email: values.email.trim(),
          password: values.password,
        });

        toast.success("Sign in successful.");
        router.push(searchParams.get("redirect") || "/");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Authentication failed."));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mb-8 text-muted-foreground">
            {isSignUp
              ? "Fill in your details to get started"
              : "Sign in to continue"}
          </p>

          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={() => void handleGoogleSignIn()}
            className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirecting to Google...
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.39 3.61v2.99h3.87c2.26-2.08 3.56-5.14 3.56-8.63z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-2.99c-1.07.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.76-4.98H1.24v3.13A12 12 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 14.28A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.56.38-2.28V6.59H1.24A12 12 0 0 0 0 12c0 1.94.46 3.78 1.24 5.41l4-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.16 15.23 0 12 0A12 12 0 0 0 1.24 6.59l4 3.13c.95-2.86 3.62-4.95 6.76-4.95z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FieldGroup className="gap-5">
              <Field data-invalid={form.formState.errors.email ? true : undefined}>
                <FieldLabel htmlFor="auth-email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="auth-email"
                    type="email"
                    placeholder="Enter your email"
                    aria-invalid={form.formState.errors.email ? true : undefined}
                    {...form.register("email")}
                  />
                </InputGroup>
                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={form.formState.errors.password ? true : undefined}>
                <FieldLabel htmlFor="auth-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    aria-invalid={form.formState.errors.password ? true : undefined}
                    {...form.register("password")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{form.formState.errors.password?.message}</FieldError>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  form.reset();
                }}
                className="font-semibold text-primary hover:opacity-80"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
