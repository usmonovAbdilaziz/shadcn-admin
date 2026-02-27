import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientState {
  token: string | null
  phone: string | null
  fullName: string | null
  clientId: string | null
  tableId: string | null
  businessId?: string | null
  setClient: (data: {
    token: string
    phone: string
    fullName?: string
    clientId?: string
  }) => void
  setClientId: (clientId: string) => void
  setTableId: (tableId: string) => void
  setBusinessId: (businessId: string) => void
  clearTableId: () => void
  logout: () => void
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      token: null,
      phone: null,
      businessId: null,
      clientId: null,
      fullName: null,
      tableId: localStorage.getItem('tableId') ?? null,
      setClient: (data) => set({
        token: data.token,
        phone: data.phone,
        fullName: data.fullName || null,
        clientId: data.clientId || null,
      }),
      setClientId: (clientId) => set({ clientId }),
      setTableId: (tableId) => {
        localStorage.setItem('tableId', tableId)
        set({ tableId })
      },
      clearTableId: () => {
        localStorage.removeItem('tableId')
        set({ tableId: null })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, phone: null, fullName: null, clientId: null })
      },
      setBusinessId: (businessId) => set({ businessId }),
    }),
    {
      name: 'client-storage',
    }
  )
)
