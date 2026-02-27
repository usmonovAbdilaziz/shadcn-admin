import axios from 'axios'
import { baseApiv1 } from './baseApi'
import { getClientMe } from './client'
import { useClientStore } from '@/store/use-client-store'

const resolveClientIdFromMe = (me: any): string | null => {
  return me?.data?.id || me?.id || null
}

export const createBooking = async (booking: any) => {
  const token = localStorage.getItem('token')
  const { businessId: storedBusinessId, clientId: storedClientId } =
    useClientStore.getState()

  let clientId = booking?.clientId || storedClientId || null
  if (!clientId && token) {
    const me = await getClientMe(token)
    clientId = resolveClientIdFromMe(me)
    if (clientId) {
      useClientStore.getState().setClientId(clientId)
    }
  }

  const businessId = booking?.businessId || storedBusinessId

  if (!businessId) {
    throw new Error('Business ID not found for booking creation')
  }

  if (!clientId) {
    throw new Error('Client ID not found for booking creation')
  }

  const payload = {
    ...booking,
    businessId,
    clientId,
  }

  const response = await axios.post(`${baseApiv1}/booking/client`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return response.data
}

export const getClientBookings = async (clientId: string) => {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${baseApiv1}/booking/client/${clientId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return response.data
}
