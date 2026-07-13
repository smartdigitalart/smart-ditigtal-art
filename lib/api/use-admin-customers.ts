"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listCustomersAction,
  updateCustomerAction,
  updateCustomerRoleAction,
} from "@/app/admin/(protected)/customers/actions"
import type { Customer, CustomerUpdatePayload } from "@/lib/types/customer"

const KEY = ["admin-customers"] as const

export function useAdminCustomers() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => ({ items: await listCustomersAction() }),
  })
}

export function useUpdateAdminCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CustomerUpdatePayload
    }) => updateCustomerAction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateCustomerRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Customer["role"] }) =>
      updateCustomerRoleAction(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
