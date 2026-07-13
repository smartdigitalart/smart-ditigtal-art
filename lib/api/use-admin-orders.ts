"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listOrdersAction,
  updateOrderStatusAction,
} from "@/app/admin/(protected)/orders/actions"
import type { OrderStatus } from "@/lib/types/order"

const KEY = ["admin-orders"] as const

export function useAdminOrders() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ({ items: await listOrdersAction() }),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatusAction(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
