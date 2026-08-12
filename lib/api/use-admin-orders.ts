"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteOrderAction,
  getOrderStatusHistoryAction,
  listOrdersAction,
  updateOrderNotesAction,
  updateOrderShippingAddressAction,
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: KEY })
      void queryClient.invalidateQueries({
        queryKey: ["order-status-history", variables.id],
      })
    },
  })
}

export function useOrderStatusHistory(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["order-status-history", orderId],
    queryFn: () => getOrderStatusHistoryAction(orderId),
    enabled,
  })
}

export function useUpdateOrderNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes: string }) =>
      updateOrderNotesAction(id, adminNotes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateOrderShippingAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      shippingAddress,
    }: {
      id: string
      shippingAddress: string
    }) => updateOrderShippingAddressAction(id, shippingAddress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOrderAction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
