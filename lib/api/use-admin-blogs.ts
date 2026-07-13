"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createBlogAction,
  deleteBlogAction,
  listBlogsAction,
  updateBlogAction,
} from "@/app/admin/(protected)/blogs/actions"
import type { BlogPayload } from "@/lib/types/blog"

const KEY = ["admin-blogs"] as const

export function useAdminBlogs() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ({ items: await listBlogsAction() }),
  })
}

export function useCreateAdminBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BlogPayload) => createBlogAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateAdminBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BlogPayload }) =>
      updateBlogAction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteAdminBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlogAction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
