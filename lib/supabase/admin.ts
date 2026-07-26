import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"

export function createAdminClient() {
  const { url } = getSupabaseEnv()
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY. Set it in .env.local (server-only, never NEXT_PUBLIC_)."
    )
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  })
}
