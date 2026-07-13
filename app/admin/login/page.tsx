"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Lock,
  User,
  ArrowRight,
  Zap,
  Server,
  KeyRound,
} from "lucide-react";

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

const features = [
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description: "Track system performance instantly",
  },
  {
    icon: Server,
    title: "Full System Access",
    description: "Complete control over configurations",
  },
  {
    icon: KeyRound,
    title: "Secure Authentication",
    description: "Enterprise-grade security protocols",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch("/admin-session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Invalid credentials");
        return;
      }

      toast.success("Login successful");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Left Panel - Branding */}
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:w-1/2">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-center items-center px-16">
          <div className="w-full max-w-md">
            <Link href="/" aria-label="Go to home" className="mb-12 block w-fit">
              <Image
                src="/logo.png"
                alt="PLC Expert"
                width={220}
                height={34}
                className="h-9 w-auto"
                priority
              />
            </Link>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-background">
              Administrative
              <br />
              Control Panel
            </h1>
            <p className="mb-12 text-lg leading-relaxed text-background/60">
              Secure access to your management dashboard. Monitor, configure,
              and control your entire system from one place.
            </p>

            <div className="space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
                    <feature.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-background">
                      {feature.title}
                    </p>
                    <p className="text-sm text-background/50">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="mb-8 flex justify-center rounded-xl bg-foreground px-6 py-4 lg:hidden">
            <Link href="/" aria-label="Go to home">
              <Image
                src="/logo.png"
                alt="PLC Expert"
                width={180}
                height={28}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          <Card className="ring-border/50 shadow-sm">
            <CardContent className="px-8 py-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to your admin account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="emailOrUsername"
                    className="text-sm font-medium text-foreground"
                  >
                    Email or Username
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="emailOrUsername"
                      placeholder="Enter your email or username"
                      className="h-11 border-border bg-background pl-10 focus-visible:border-secondary focus-visible:ring-secondary/30"
                      {...register("emailOrUsername", {
                        required: "Email or username is required",
                      })}
                    />
                  </div>
                  {errors.emailOrUsername && (
                    <p className="text-sm text-destructive">
                      {errors.emailOrUsername.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="h-11 border-border bg-background pl-10 focus-visible:border-secondary focus-visible:ring-secondary/30"
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-lg bg-secondary font-medium text-secondary-foreground hover:bg-secondary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-center text-xs text-muted-foreground">
                  Protected admin access. Unauthorized attempts are logged and
                  monitored.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
