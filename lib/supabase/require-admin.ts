import "server-only"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface AdminProfile {
  id: string
  name: string | null
  email: string | null
  role: "customer" | "admin"
  avatar_url: string | null
}

export async function requireAdminProfile(): Promise<AdminProfile> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData) {
    throw new Error("UNAUTHENTICATED")
  }

  const userId = claimsData.claims.sub

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, email, role, avatar_url")
    .eq("id", userId)
    .maybeSingle()

  if (profile?.role !== "admin") {
    throw new Error("FORBIDDEN")
  }

  return profile as AdminProfile
}
