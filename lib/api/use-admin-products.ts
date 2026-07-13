"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createProductAction,
  deleteProductAction,
  listProductsAction,
  updateProductAction,
} from "@/app/admin/(protected)/products/actions"
import type { ProductPayload } from "@/lib/types/product"

const KEY = ["admin-products"] as const

export function useAdminProducts() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ({ items: await listProductsAction() }),
  })
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProductAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      updateProductAction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
