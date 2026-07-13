import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const user = await verifyAdminToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (!user) {
    redirect("/admin/login");
  }

  return <div className="flex flex-1 flex-col gap-4">Dashboard</div>;
}
