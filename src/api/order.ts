import axios from 'axios'
import { baseApiv1 } from './baseApi'

/**
 * Create an order.
 * If `token` is provided (authenticated client), the backend will immediately
 * confirm the order — no Telegram redirect needed.
 */
export const createOrder = async (
  tableId: string,
  items: unknown[],
  token?: string | null
) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await axios.post(
    `${baseApiv1}/orders`,
    { tableId, items },
    { headers }
  )
  return res.data
}

export const getOrderStatus = async (orderId: string) => {
  const res = await axios.get(`${baseApiv1}/orders/${orderId}`)
  return res.data
}

export const getOrderSessionStatus = async (
  orderSessionId: string,
  tableId: string
) => {
  const res = await axios.get(
    `${baseApiv1}/orders/sessions/${orderSessionId}/status`,
    {
      params: { tableId },
    }
  )
  return res.data
}
