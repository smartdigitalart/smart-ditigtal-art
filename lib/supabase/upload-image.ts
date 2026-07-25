import { createClient } from "@/lib/supabase/server"

export type ImageUploadResult =
  | { url: string; error?: never }
  | { error: string; url?: never }

export async function uploadImageToMediaBucket(
  formData: FormData,
  idField: string,
  folder: string
): Promise<ImageUploadResult> {
  const uploadId = formData.get(idField)
  const file = formData.get("file")

  if (typeof uploadId !== "string" || uploadId.length === 0) {
    return { error: "Missing upload destination." }
  }

  if (!(file instanceof File)) {
    return { error: "No image file provided." }
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Please upload a valid image file." }
  }

  const supabase = await createClient()
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
  const path = `${folder}/${uploadId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return { error: error.message || "Failed to upload image." }
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return { url: data.publicUrl }
}
