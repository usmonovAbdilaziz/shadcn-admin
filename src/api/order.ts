import axios from 'axios'
import { baseApiv1 } from './baseApi'

export const createOrder = async (tableId: string, items: any[]) => {
  const res = await axios.post(`${baseApiv1}/orders`, { tableId, items })
  return res.data
}

export const getOrderStatus = async (orderId: string) => {
  const res = await axios.get(`${baseApiv1}/orders/${orderId}`)
  return res.data
}
