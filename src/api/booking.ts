import axios from 'axios'
import { baseApiv1 } from './baseApi'

export const createBooking = async (booking: {
  tableId: string
  items: Array<{
    productId: string
    qty: number
    priceSnapshot?: number
    note?: string
  }>
  note?: string
  idempotencyKey?: string
}) => {
  const token = localStorage.getItem('token')

  const response = await axios.post(`${baseApiv1}/booking/client`, booking, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(booking.idempotencyKey
        ? { 'Idempotency-Key': booking.idempotencyKey }
        : {}),
    },
  })

  return response.data
}

export const getClientBookings = async (
  clientId: string,
  params?: Record<string, string | number | undefined>
) => {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${baseApiv1}/booking/client/${clientId}`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return response.data
}
