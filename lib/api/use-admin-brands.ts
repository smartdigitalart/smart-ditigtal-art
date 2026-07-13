"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createBrandAction,
  deleteBrandAction,
  listBrandsAction,
  updateBrandAction,
} from "@/app/admin/(protected)/brands/actions"
import type { BrandPayload } from "@/lib/types/brand"

const KEY = ["admin-brands"] as const

export function useAdminBrands() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ({ items: await listBrandsAction() }),
  })
}

export function useCreateAdminBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BrandPayload) => createBrandAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateAdminBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BrandPayload }) =>
      updateBrandAction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteAdminBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrandAction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
