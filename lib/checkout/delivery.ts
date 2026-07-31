export const DELIVERY_CHARGES = {
  inside_dhaka: 70,
  outside_dhaka: 120,
} as const

export type DeliveryZone = keyof typeof DELIVERY_CHARGES
