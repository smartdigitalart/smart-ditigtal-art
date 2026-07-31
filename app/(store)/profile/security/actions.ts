"use server"

import { createClient } from "@/lib/supabase/server"

export async function changeMyPasswordAction(payload: {
  newPassword: string
}): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.auth.updateUser({
    password: payload.newPassword,
  })

  if (error) throw error
}
