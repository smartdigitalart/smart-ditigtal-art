"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RichTextEditor } from "@/components/tiptap/rich-text-editor"
import { CoverImageUpload } from "@/components/blogs/cover-image-upload"
import { useCreateAdminBlog, useUpdateAdminBlog } from "@/lib/api/use-admin-blogs"
import {
  uploadBlogImageAction,
  deleteBlogUploadAction,
} from "@/app/admin/(protected)/blogs/actions"
import { BLOG_STATUSES, type Blog } from "@/lib/types/blog"
import { slugify } from "@/lib/utils"

const STATUS_ITEMS = BLOG_STATUSES.map((status) => ({
  label: status,
  value: status,
}))

export interface BlogFormValues {
  title: string
  slug: string
  content: string
  coverImage: string | null
  status: Blog["status"]
}

export function BlogForm({ blog }: { blog?: Blog }) {
  const router = useRouter()
  const isEdit = !!blog
  const createBlog = useCreateAdminBlog()
  const updateBlog = useUpdateAdminBlog()
  const saving = createBlog.isPending || updateBlog.isPending

  // Generated up front so cover images can upload into this post's
  // uploads/blogs/{id} folder before the post itself has been saved.
  const [blogId] = useState(() => blog?.id ?? crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      content: blog?.content ?? "",
      coverImage: blog?.coverImage ?? null,
      status: blog?.status ?? "Draft",
    },
  })

  const slugTouchedRef = useRef(isEdit)
  const title = watch("title")

  useEffect(() => {
    if (slugTouchedRef.current) return
    setValue("slug", slugify(title))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  const onSubmit = async (data: BlogFormValues) => {
    const payload = {
      ...(isEdit ? {} : { id: blogId }),
      title: data.title,
      slug: data.slug,
      content: data.content,
      coverImage: data.coverImage,
      status: data.status,
    }

    try {
      if (isEdit) {
        await updateBlog.mutateAsync({ id: blog.id, payload })
      } else {
        await createBlog.mutateAsync(payload)
      }

      toast.success(isEdit ? "Post updated" : "Post created", {
        description: data.title,
      })
      router.push("/admin/blogs")
    } catch {
      toast.error("Failed to save post")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.push("/admin/blogs")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to blogs
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Post" : "Add Post"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details for this blog post."
            : "Fill in the details to publish a new blog post."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Post details</CardTitle>
                <CardDescription>
                  Basic information shown on the blog listing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Cover image</FieldLabel>
                    <CoverImageUpload
                      value={watch("coverImage")}
                      onChange={(url) => setValue("coverImage", url)}
                      uploadAction={uploadBlogImageAction}
                      deleteAction={deleteBlogUploadAction}
                      originalValue={blog?.coverImage ?? null}
                      blogId={blogId}
                    />
                  </Field>

                  <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      placeholder="e.g. How to Download PLC Software"
                      aria-invalid={!!errors.title}
                      {...register("title", { required: "Title is required" })}
                    />
                    <FieldError errors={[errors.title]} />
                  </Field>

                  <Field data-invalid={!!errors.slug}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="slug">Slug</FieldLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Regenerate slug"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => {
                          slugTouchedRef.current = false
                          setValue("slug", slugify(title))
                        }}
                      >
                        <RefreshCwIcon />
                      </Button>
                    </div>
                    <Input
                      id="slug"
                      placeholder="e.g. how-to-download-plc-software"
                      aria-invalid={!!errors.slug}
                      {...register("slug", {
                        required: "Slug is required",
                        onChange: () => {
                          slugTouchedRef.current = true
                        },
                      })}
                    />
                    <FieldError errors={[errors.slug]} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>The full blog post body.</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={watch("content")}
                  onChange={(html) => setValue("content", html)}
                  placeholder="Write the post content..."
                  minHeight="min-h-60"
                  toolbar="full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>Control whether this post is live.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      value={watch("status")}
                      onValueChange={(value) =>
                        value && setValue("status", value as Blog["status"])
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {STATUS_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/blogs")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? "Save changes" : "Create post"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
