"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface OwnProfile {
  name: string | null
  email: string | null
  role: "customer" | "admin"
}

export async function getOwnProfileAction(): Promise<OwnProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from("profiles")
    .select("name, email, role")
    .eq("id", user.id)
    .maybeSingle()

  return data as OwnProfile | null
}

export async function updateOwnProfileAction(payload: {
  name: string
  phone: string
}): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .update({ name: payload.name, phone: payload.phone })
    .eq("id", user.id)

  if (error) throw error
}
