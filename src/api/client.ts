import axios from 'axios'
import { baseApiv1 } from './baseApi'

export const getClientTable = async (tableId?: string) => {
  const res = await axios.get(`${baseApiv1}/table/${tableId ? tableId : ''}`)
  return res.data
}
export const getClientServices = async () => {
  const res = await axios.get(`${baseApiv1}/service`)
  return res.data
}
