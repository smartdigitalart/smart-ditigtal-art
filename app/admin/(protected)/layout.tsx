import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const admin = await verifyAdminToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (!admin) {
    redirect("/admin/login");
  }

  const user = {
    name: admin.username ?? "Admin",
    email: admin.email ?? "",
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
            <Button variant="outline" size="sm" render={<Link href="/" />}>
              <HomeIcon data-icon="inline-start" />
              Home
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
