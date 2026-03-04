import { useState } from 'react'
import LoadingBar from 'react-top-loading-bar'
import { useGetAllBooking } from '@/hooks/business'
import { BookingTable } from './bookign-component/BookingTabel'

export const BookingPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const businessId = user?.business?.id || ''
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: bookings, isLoading } = useGetAllBooking(
    businessId,
    page,
    pageSize
  )
  const bookingData = bookings?.data
  const bookingItems = bookingData?.items || []
  const totalPages = bookingData?.totalPages ?? 1
  const currentPage = bookingData?.page ?? page

  if (isLoading) {
    return (
      <div>
        <LoadingBar progress={30} />
      </div>
    )
  }
  return (
    <div>
      <BookingTable
        data={bookingItems}
        page={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
