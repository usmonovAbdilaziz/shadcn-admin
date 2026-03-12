import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TeaColor = 'QORA' | 'KOK'

export interface TeaOptions {
  teaColor: TeaColor
  lemon: boolean
}

export interface CartOptions {
  teaOptions?: TeaOptions
  liter?: string
}

export interface CartServiceSummary {
  id: string
  price: number | string
  name?: string | null
  description?: string | null
  photoUrl?: string | null
  [key: string]: unknown
}

export interface CartItem {
  id: string
  serviceId: string
  qty: number
  options: CartOptions
  priceSnapshot: number
  description?: string
  service: CartServiceSummary // Keep full service object for UI convenience
}

interface CartState {
  items: CartItem[]
  addToCart: (service: CartServiceSummary, options: CartOptions) => void
  removeFromCart: (itemId: string) => void
  updateQty: (itemId: string, delta: number) => void
  setItemDescription: (itemId: string, description: string) => void
  clearCart: () => void
  syncTotals: () => void
  totalPrice: number
  totalItems: number
}

const normalizeCartOptions = (options: CartOptions): CartOptions => {
  const normalizedOptions: CartOptions = {}

  if (options.liter) {
    normalizedOptions.liter = options.liter
  }

  if (options.teaOptions) {
    normalizedOptions.teaOptions = {
      lemon: options.teaOptions.lemon,
      teaColor: options.teaOptions.teaColor,
    }
  }

  return normalizedOptions
}

export const makeCartKey = (serviceId: string, options: CartOptions) => {
  return `${serviceId}-${JSON.stringify(normalizeCartOptions(options))}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      totalItems: 0,

      addToCart: (service, options) => {
        const itemId = makeCartKey(service.id, options)
        const items = get().items
        const existingItem = items.find((item) => item.id === itemId)

        // Calculate price
        let price = Number(service.price)
        if (options.teaOptions?.lemon) {
          price += 2000 // Lemon extra price
        }
        if (options.liter) {
          price = price * parseFloat(options.liter)
        }

        let newItems: CartItem[]
        if (existingItem) {
          newItems = items.map((item) =>
            item.id === itemId ? { ...item, qty: item.qty + 1 } : item
          )
        } else {
          newItems = [
            ...items,
            {
              id: itemId,
              serviceId: service.id,
              qty: 1,
              options,
              priceSnapshot: price,
              service,
            },
          ]
        }

        set({
          items: newItems,
          totalPrice: newItems.reduce((s, i) => s + i.priceSnapshot * i.qty, 0),
          totalItems: newItems.reduce((s, i) => s + i.qty, 0),
        })
      },

      removeFromCart: (itemId) => {
        const newItems = get().items.filter((item) => item.id !== itemId)
        set({
          items: newItems,
          totalPrice: newItems.reduce((s, i) => s + i.priceSnapshot * i.qty, 0),
          totalItems: newItems.reduce((s, i) => s + i.qty, 0),
        })
      },

      updateQty: (itemId, delta) => {
        const newItems = get()
          .items.map((item) => {
            if (item.id === itemId) {
              const newQty = Math.max(0, item.qty + delta)
              return { ...item, qty: newQty }
            }
            return item
          })
          .filter((item) => item.qty > 0)

        set({
          items: newItems,
          totalPrice: newItems.reduce((s, i) => s + i.priceSnapshot * i.qty, 0),
          totalItems: newItems.reduce((s, i) => s + i.qty, 0),
        })
      },

      setItemDescription: (itemId, description) => {
        const newItems = get().items.map((item) =>
          item.id === itemId ? { ...item, description } : item
        )

        set({ items: newItems })
      },

      clearCart: () => {
        set({ items: [], totalPrice: 0, totalItems: 0 })
      },

      syncTotals: () => {
        const items = get().items
        set({
          totalPrice: items.reduce((s, i) => s + i.priceSnapshot * i.qty, 0),
          totalItems: items.reduce((s, i) => s + i.qty, 0),
        })
      },
    }),
    {
      name: 'client-cart-storage',
    }
  )
)
