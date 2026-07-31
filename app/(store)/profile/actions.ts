"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface OwnProfile {
  id: string
  name: string | null
  email: string | null
  role: "customer" | "admin"
  phone: string | null
  avatar: string | null
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
    .select("id, name, email, role, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    avatar: data.avatar_url,
  }
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
