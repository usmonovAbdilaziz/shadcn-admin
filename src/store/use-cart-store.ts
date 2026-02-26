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

export interface CartItem {
  id: string
  serviceId: string
  qty: number
  options: CartOptions
  priceSnapshot: number
  service: any // Keep full service object for UI convenience
}

interface CartState {
  items: CartItem[]
  addToCart: (service: any, options: CartOptions) => void
  removeFromCart: (itemId: string) => void
  updateQty: (itemId: string, delta: number) => void
  clearCart: () => void
  syncTotals: () => void
  totalPrice: number
  totalItems: number
}

export const makeCartKey = (serviceId: string, options: CartOptions) => {
  // Stable stringification of options
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = (options as any)[key]
      if (typeof acc[key] === 'object' && acc[key] !== null) {
        // Sort sub-options (like teaOptions)
        acc[key] = Object.keys(acc[key])
          .sort()
          .reduce((subAcc: any, subKey) => {
            subAcc[subKey] = (acc[key] as any)[subKey]
            return subAcc
          }, {})
      }
      return acc
    }, {})

  return `${serviceId}-${JSON.stringify(sortedOptions)}`
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
        const newItems = get().items
          .map((item) => {
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
