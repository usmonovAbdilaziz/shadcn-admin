import axios from 'axios'
import { baseApiv1 } from './baseApi'
export const createBooking = async (booking: any) => {
    const response = await axios.post(`${baseApiv1}/booking/client`, booking)
    return response.data
}