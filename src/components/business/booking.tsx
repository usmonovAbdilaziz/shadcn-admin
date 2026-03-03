import LoadingBar from 'react-top-loading-bar'
import { useGetAllBooking } from '@/hooks/business'
import { BookingTable } from './bookign-component/BookingTabel'

export const BookingPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const businessId = user?.business?.id || ''
  const { data: bookings, isLoading } = useGetAllBooking(businessId)
  const bookingItems = bookings?.data?.items || []

  if (isLoading) {
    return (
      <div>
        <LoadingBar progress={30} />
      </div>
    )
  }
  return (
    <div>
      <BookingTable data={bookingItems} />
    </div>
  )
}
