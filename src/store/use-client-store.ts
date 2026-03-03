import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ClientUser = {
  id: string
  role: 'CLIENT' | 'BUSINESS' | 'ADMIN' | 'STAFF'
  businessId?: string | null
  staffId?: string | null
  fullName?: string | null
  phone?: string | null
}

interface ClientState {
  token: string | null
  user: ClientUser | null
  phone: string | null
  fullName: string | null
  clientId: string | null
  tableId: string | null
  businessId?: string | null
  orderSessionId: string | null
  setClient: (data: {
    token: string
    phone?: string | null
    fullName?: string | null
    clientId?: string
  }) => void
  setAuth: (data: { token: string; user: ClientUser }) => void
  setClientId: (clientId: string) => void
  setTableId: (tableId: string) => void
  setBusinessId: (businessId: string) => void
  setOrderSessionId: (orderSessionId: string | null) => void
  clearTableId: () => void
  logout: () => void
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      phone: null,
      businessId: null,
      clientId: null,
      fullName: null,
      orderSessionId: null,
      tableId: localStorage.getItem('tableId') ?? null,
      setClient: (data) =>
        set({
          token: data.token,
          phone: data.phone ?? null,
          fullName: data.fullName ?? null,
          clientId: data.clientId ?? null,
          user: data.clientId
            ? {
                id: data.clientId,
                role: 'CLIENT',
                fullName: data.fullName ?? null,
                phone: data.phone ?? null,
              }
            : null,
        }),
      setAuth: ({ token, user }) =>
        set({
          token,
          user,
          phone: user.phone ?? null,
          fullName: user.fullName ?? null,
          clientId: user.role === 'CLIENT' ? user.id : null,
          businessId: user.businessId ?? get().businessId ?? null,
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
        set({
          token: null,
          user: null,
          phone: null,
          fullName: null,
          clientId: null,
          orderSessionId: null,
        })
      },
      setBusinessId: (businessId) => set({ businessId }),
      setOrderSessionId: (orderSessionId) => set({ orderSessionId }),
    }),
    {
      name: 'client-storage',
    }
  )
)
