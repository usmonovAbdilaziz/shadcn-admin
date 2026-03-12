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
  options?: {
    search?: string
    status?: string
    pagination?: { page: number; size: number }
  }
) => {
  const params = new URLSearchParams({ type: position })
  if (options?.status) {
    params.append('status', options.status)
  }
  if (options?.pagination) {
    params.append('page', options.pagination.page.toString())
    params.append('size', options.pagination.size.toString())
  }
  const search = options?.search?.trim()
  if (search) {
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
export const staffUpdate = async (id: string, data: unknown) => {
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
