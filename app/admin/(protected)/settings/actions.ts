"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminProfile } from "@/lib/supabase/require-admin"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import {
  uploadImageToMediaBucket,
  type ImageUploadResult,
} from "@/lib/supabase/upload-image"
import { normalizeSiteSettings } from "@/lib/site-settings"
import type { SiteSettings, SiteSettingsPayload } from "@/lib/types/site-settings"

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "Use a full URL starting with http:// or https://.",
  })

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[+\d][\d\s().-]{6,}$/.test(value), {
    message: "Enter a valid WhatsApp number.",
  })

const settingsSchema = z.object({
  heroBanners: z
    .array(
      z.object({
        id: z.string().min(1),
        imageUrl: z.string().trim().min(1, "Upload a banner image."),
        alt: z.string().trim().min(1, "Add alt text for the banner."),
      })
    )
    .min(1, "Add at least one banner.")
    .max(4, "Use up to 4 hero banners."),
  categoryPromoCards: z
    .array(
      z.object({
        id: z.enum(["art", "perfume"]),
        href: z.string().trim().min(1, "Add a promo card link."),
        imageUrl: z.string().trim().min(1, "Upload a promo card image."),
        alt: z.string().trim().min(1, "Add alt text for the promo card."),
        eyebrow: z.string().trim().min(1, "Add promo card eyebrow text."),
        title: z.string().trim().min(1, "Add promo card title."),
        cta: z.string().trim().min(1, "Add promo card button text."),
      })
    )
    .length(2, "Keep both Art and Perfume promo cards."),
  socialLinks: z.object({
    facebook: optionalUrlSchema,
    instagram: optionalUrlSchema,
    messenger: optionalUrlSchema,
    whatsapp: optionalPhoneSchema,
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || z.string().email().safeParse(value).success,
        "Enter a valid email address."
      ),
  }),
  headerCategoryIds: z.array(z.string().min(1)),
})

export async function getAdminSiteSettingsAction(): Promise<SiteSettings> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_banners, social_links")
    .eq("id", "main")
    .maybeSingle()

  if (error) {
    return normalizeSiteSettings(null)
  }

  return normalizeSiteSettings(data)
}

export async function updateSiteSettingsAction(
  payload: SiteSettingsPayload
): Promise<SiteSettings> {
  await requireAdminProfile()
  const parsed = settingsSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid settings.")
  }

  const supabase = createAdminClient()
  const socialLinksWithExtras = {
    ...parsed.data.socialLinks,
    categoryPromoCards: parsed.data.categoryPromoCards,
    headerCategoryIds: parsed.data.headerCategoryIds,
  }
  const { data, error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: "main",
        hero_banners: parsed.data.heroBanners,
        social_links: socialLinksWithExtras,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("hero_banners, social_links")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/", "layout")
  revalidatePath("/admin/settings")

  return normalizeSiteSettings(data)
}

export interface HeaderNavCategory {
  id: string
  name: string
  slug: string
}

export async function getHeaderNavCategoriesAction(): Promise<HeaderNavCategory[]> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("status", "ACTIVE")
    .is("parent_id", null)
    .order("name")

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
  }))
}

export async function uploadHeroBannerAction(
  formData: FormData
): Promise<ImageUploadResult> {
  await requireAdminProfile()
  return uploadImageToMediaBucket(formData, "bannerId", "site/hero")
}

export async function deleteHeroBannerUploadAction(
  _bannerId: string,
  url: string
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}

export async function uploadCategoryPromoCardAction(
  formData: FormData
): Promise<ImageUploadResult> {
  await requireAdminProfile()
  return uploadImageToMediaBucket(formData, "promoCardId", "site/category-promos")
}

export async function deleteCategoryPromoCardUploadAction(
  _promoCardId: string,
  url: string
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
