import { useDeferredValue, useState } from 'react'
import { Input } from '../ui/input'
import { BookingList } from './_components/bookignDetail'
import { useGetStaffBookings, useUpdateBookingStatus } from '@/hooks/staff'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  useBookingRealtimeInvalidation,
  useBusinessBookingRoom,
} from '@/hooks/booking-realtime'

const APPROVAL_SECTIONS = [
  {
    status: 'PENDING',
    title: 'Kutilmoqda',
    empty: 'Kutilayotgan buyurtma yo`q',
  },
  {
    status: 'CONFIRMED',
    title: 'Tasdiqlanmoqda',
    empty: 'Tasdiqlanayotgan buyurtma yo`q',
  },
  {
    status: 'COMPLETED',
    title: 'Tasdiqlangan',
    empty: 'Tasdiqlangan buyurtma yo`q',
  },
] as const

type ApprovalStatus = (typeof APPROVAL_SECTIONS)[number]['status']

type StaffUser = {
  position?: string
  businessId?: string | null
  business?: {
    id?: string | null
  } | null
}

const getStoredStaff = (): StaffUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

export const StaffBookings = () => {
  const staff = getStoredStaff()
  const [searchId, setSearchId] = useState('')
  const [activeTab, setActiveTab] = useState<ApprovalStatus>('PENDING')
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateBookingStatus()

  const position = String(staff.position || '')
  const businessId = staff.businessId || staff.business?.id || null
  const normalizedPosition = position.toUpperCase()
  const canApproveBookings =
    normalizedPosition === 'CASHIER' || normalizedPosition === 'MANAGER'

  useBusinessBookingRoom(businessId)
  useBookingRealtimeInvalidation([['staff-bookings']], Boolean(position))

  const deferredSearch = useDeferredValue(searchId)
  const search = deferredSearch.trim()
  const effectiveApprovalStatus: ApprovalStatus =
    search.length > 0 ? 'PENDING' : activeTab

  const approvalQuery = useGetStaffBookings(canApproveBookings ? position : '', {
    search,
    status: effectiveApprovalStatus,
  })
  const generalQuery = useGetStaffBookings(canApproveBookings ? '' : position, {
    search,
  })

  const generalBookings = generalQuery.data?.data?.items || []
  const activeApprovalSection =
    APPROVAL_SECTIONS.find((section) => section.status === effectiveApprovalStatus) ??
    APPROVAL_SECTIONS[0]
  const approvalBookings = approvalQuery.data?.data?.items || []
  const isLoading = canApproveBookings
    ? approvalQuery.isLoading
    : generalQuery.isLoading
  const hasError = canApproveBookings
    ? approvalQuery.error
    : generalQuery.error

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id, status })
  }

  return (
    <div className='space-y-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>Buyurtmalar</h1>
        <Input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder='ID yoki telefon orqali qidiring'
        />
        {canApproveBookings && search ? (
          <p className='text-sm text-muted-foreground'>
            Qidiruv natijasida faqat kutilayotgan buyurtmalar ko'rsatiladi.
          </p>
        ) : null}
      </div>

      {isLoading ? <p>Loading...</p> : null}
      {hasError ? (
        <p className='text-destructive'>Error loading bookings</p>
      ) : null}

      {!canApproveBookings && !isLoading && !hasError ? (
        generalBookings.length > 0 ? (
          <BookingList
            bookings={generalBookings}
            canUpdateStatus={false}
            isUpdating={isUpdating}
          />
        ) : (
          <p>Booking topilmadi</p>
        )
      ) : null}

      {canApproveBookings && !isLoading && !hasError ? (
        <Tabs
          value={effectiveApprovalStatus}
          onValueChange={(value) => setActiveTab(value as ApprovalStatus)}
          className='rounded-xl border border-border/60 bg-card/60 p-4'
        >
          <TabsList className='grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0'>
            {APPROVAL_SECTIONS.map((section) => (
              <TabsTrigger
                key={section.status}
                value={section.status}
                disabled={Boolean(search) && section.status !== 'PENDING'}
                className='border border-border/60 bg-muted/20 py-2 data-[state=active]:border-primary data-[state=active]:bg-background'
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={effectiveApprovalStatus} className='mt-4 space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>{activeApprovalSection.title}</h2>
              <p className='text-sm text-muted-foreground'>
                {approvalBookings.length} ta booking
              </p>
            </div>

            {approvalBookings.length > 0 ? (
              <BookingList
                bookings={approvalBookings}
                canUpdateStatus
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating}
              />
            ) : (
              <p className='text-sm text-muted-foreground'>
                {activeApprovalSection.empty}
              </p>
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}
