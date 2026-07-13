"use server"

import { createClient } from "@/lib/supabase/server"

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

  const { error } = await supabase
    .from("profiles")
    .update({ name: payload.name, phone: payload.phone })
    .eq("id", user.id)

  if (error) throw error
}
