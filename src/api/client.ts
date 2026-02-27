import axios from 'axios'
import { baseApi, baseApiv1 } from './baseApi'

export const getClientTable = async (params?: any) => {
  const res = await axios.get(`${baseApiv1}/table${params.businessId?"/business/"+params.businessId:''}/${params.tableId?params.tableId:''}`)
  return res.data
}
export const getClientServices = async (businessId: string) => {
  const res = await axios.get(`${baseApiv1}/service/?businessId=${businessId}`)
  return res.data
}
export const getClientMe = async (token: string) => {
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Client token not found')
  }

  const res = await axios.get(`${baseApi}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
export const getBusenessAll=async()=>{
  const res = await axios.get(`${baseApiv1}/business`)
  return res.data
}
