import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeIcon } from "lucide-react";

import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/signin?redirect=/admin/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const user = {
    name: profile.name || authUser.email || "Admin",
    email: profile.email || authUser.email || "",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <AdminBreadcrumb />
          </div>
          <div className="px-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <HomeIcon data-icon="inline-start" />
                Home
              </Link>
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
