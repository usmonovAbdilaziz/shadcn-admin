import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientState {
  token: string | null
  phone: string | null
  fullName: string | null
  setClient: (data: { token: string; phone: string; fullName?: string }) => void
  logout: () => void
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      token: null,
      phone: null,
      fullName: null,
      setClient: (data) => set({ 
        token: data.token, 
        phone: data.phone,
        fullName: data.fullName || null
      }),
      logout: () => set({ token: null, phone: null, fullName: null }),
    }),
    {
      name: 'client-storage',
    }
  )
)
