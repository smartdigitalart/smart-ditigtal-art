import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  productId: string
  variantId: string | null
  variantLabel: string | null
  name: string
  price: number
  salePrice: number | null
  image: string | null
  quantity: number
}

function sameLine(a: { productId: string; variantId: string | null }, b: { productId: string; variantId: string | null }) {
  return a.productId === b.productId && a.variantId === b.variantId
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  setOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string, variantId: string | null) => void
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item))
          const items = existing
            ? state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { ...item, quantity }]
          return { items, isOpen: true }
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, { productId, variantId })),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((i) => !sameLine(i, { productId, variantId }))
              : state.items.map((i) =>
                  sameLine(i, { productId, variantId }) ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "sda-cart",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0)
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}
