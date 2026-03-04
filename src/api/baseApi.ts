import axios from 'axios'
import { LoginStatus } from '../types/sign'

export const baseApi = 'http://localhost:3002'
export const baseApiv1 = 'http://localhost:3002/api/v1'
export const logIn = async (body: LoginStatus) => {
  const res = await axios.post(`${baseApi}/auth/login`, body)
  return res.data
}
export const staffLogIn = async (body: { fullName: string; phoneNumber: string }) => {
  // Use server's staff login endpoint (no password) backed by StaffAuthService
  const res = await axios.post(`${baseApi}/auth/staff/login`, body)
  return res.data
}
export const signUp = async (body: LoginStatus) => {
  const res = await axios.post(`${baseApi}/auth/register/business`, body)
  return res.data
}
