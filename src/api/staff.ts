import axios from "axios"
import { baseApiv1 } from "./baseApi"

const staffUrl = `${baseApiv1}/staff`

const getBearerConfig = () => {
  const token = localStorage.getItem('token')

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
}
export const staffBookings = async (
  position: string,
  search: string,
  pagination?: { page: number; size: number },
) => {
  const params = new URLSearchParams({ type: position })
  if (pagination) params.append('page', pagination.page.toString())
  if (pagination) params.append('size', pagination.size.toString())
  if (search) {
    // Simple logic: if it looks like a phone number (start with + or digits only), it's phoneNumber
    // Otherwise treat as bookingId (assuming CUID/UUID)
    if (/^\+?\d+$/.test(search)) {
      params.append('phoneNumber', search)
    } else {
      params.append('bookingId', search)
    }
  }

  const res = await axios.get(
    `${baseApiv1}/booking/staff/?${params.toString()}`,
    getBearerConfig(),
  )
  return res.data
}
export const staffUpdate = async (id: string, data: any) => {
  const res = await axios.patch(`${staffUrl}/${id}`, data, getBearerConfig())
  return res.data
}

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const res = await axios.patch(
    `${baseApiv1}/booking/${bookingId}/status`,
    { status },
    getBearerConfig(),
  )
  return res.data
}
