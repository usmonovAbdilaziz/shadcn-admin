import { useDeferredValue, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { BookingList, type Booking as ApprovalBooking } from './_components/bookignDetail'
import {
  BookingProgressList,
  type BookingProgressCard,
} from './_components/progress-board'
import {
  useClaimBookingDelivery,
  useCompleteBookingDelivery,
  useGetStaffBookings,
  useUpdateBookingItemProgress,
  useUpdateBookingStatus,
} from '@/hooks/staff'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  useBookingRealtimeInvalidation,
  useBusinessBookingRoom,
} from '@/hooks/booking-realtime'
import { normalizeStaffPosition } from '@/lib/staff-position'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  id?: string | null
  staffId?: string | null
  position?: string | null
  businessId?: string | null
  business?: {
    id?: string | null
  } | null
}

type BookingLifecycle = {
  id: string
  status: string
  progressStatus?: string | null
  price?: string | number | null
  items?: Array<{
    priceSnapshot: number
    qty: number
  }> | null
}

const padDateValue = (value: number) => String(value).padStart(2, '0')

const getTodayDateValue = () => {
  const now = new Date()
  return `${now.getFullYear()}-${padDateValue(now.getMonth() + 1)}-${padDateValue(
    now.getDate()
  )}`
}

const getDayRange = (dateValue: string) => {
  if (!dateValue) {
    return {}
  }

  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) {
    return {}
  }

  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)

  return {
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
  }
}

const formatMoney = (value: number) =>
  `${value.toLocaleString('uz-UZ')} so'm`

const getBookingTotal = (booking: BookingLifecycle) =>
  Number(
    booking.price ??
      booking.items?.reduce(
        (sum, item) => sum + Number(item.priceSnapshot || 0) * Number(item.qty || 0),
        0
      ) ??
      0
  ) || 0

const getStoredStaff = (): StaffUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const hasItemsWithStatus = (booking: BookingProgressCard, status: string) =>
  (booking.items || []).some(
    (item) => String(item.status || '').toUpperCase() === status
  )

const isArchivedBooking = (booking: BookingLifecycle) => {
  const status = String(booking.status || '').toUpperCase()
  const progressStatus = String(booking.progressStatus || '').toUpperCase()

  return (
    status === 'COMPLETED' ||
    status === 'CANCELLED' ||
    progressStatus === 'DELIVERED' ||
    progressStatus === 'CANCELLED'
  )
}

const areAllItemsReady = (booking: BookingProgressCard) => {
  const items = booking.items || []
  return (
    items.length > 0 &&
    items.every((item) => {
      const status = String(item.status || '').toUpperCase()
      return status === 'READY' || status === 'CANCELLED'
    })
  )
}

const getProgressGridClassName = (count: number) => {
  if (count >= 4) {
    return 'grid-cols-2 xl:grid-cols-4'
  }

  if (count === 3) {
    return 'grid-cols-3'
  }

  if (count === 2) {
    return 'grid-cols-2'
  }

  return 'grid-cols-1'
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const responseData = error.response.data as
      | { error?: { message?: string }; message?: string }
      | undefined

    return (
      responseData?.error?.message ||
      responseData?.message ||
      'Amal bajarilmadi'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Amal bajarilmadi'
}

export const StaffBookings = () => {
  const staff = getStoredStaff()
  const [searchId, setSearchId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [approvalTab, setApprovalTab] = useState<ApprovalStatus>('PENDING')
  const [progressTab, setProgressTab] = useState('queue')
  const { mutateAsync: updateStatus, isPending: isStatusUpdating } =
    useUpdateBookingStatus()
  const { mutateAsync: updateItemProgress, isPending: isItemUpdating } =
    useUpdateBookingItemProgress()
  const { mutateAsync: claimDelivery, isPending: isClaimingDelivery } =
    useClaimBookingDelivery()
  const { mutateAsync: completeDelivery, isPending: isCompletingDelivery } =
    useCompleteBookingDelivery()

  const position = String(staff.position || '')
  const normalizedPosition = normalizeStaffPosition(position) || position.toUpperCase()
  const businessId = staff.businessId || staff.business?.id || null
  const staffId = staff.staffId || staff.id || null
  const isCashier = normalizedPosition === 'CASHIER'
  const isManager = normalizedPosition === 'MANAGER'
  const isDeliveryRole =
    normalizedPosition === 'WAITER' || normalizedPosition === 'RUNNER'
  const isPreparationRole =
    normalizedPosition === 'COOK' || normalizedPosition === 'BARMEN'

  useBusinessBookingRoom(businessId)
  useBookingRealtimeInvalidation([['staff-bookings']], Boolean(position))

  const deferredSearch = useDeferredValue(searchId)
  const search = deferredSearch.trim()
  const dayRange = getDayRange(selectedDate)
  const effectiveApprovalStatus: ApprovalStatus =
    search.length > 0 ? 'PENDING' : approvalTab

  const approvalQuery = useGetStaffBookings(isCashier ? position : '', {
    search,
    status: effectiveApprovalStatus,
    ...dayRange,
  })
  const progressQuery = useGetStaffBookings(!isCashier ? position : '', {
    search,
    ...dayRange,
  })

  const approvalBookings = (approvalQuery.data?.data?.items || []) as ApprovalBooking[]
  const progressBookings = (progressQuery.data?.data?.items || []) as BookingProgressCard[]
  const activeApprovalSection =
    APPROVAL_SECTIONS.find((section) => section.status === effectiveApprovalStatus) ??
    APPROVAL_SECTIONS[0]
  const isLoading = isCashier ? approvalQuery.isLoading : progressQuery.isLoading
  const hasError = isCashier ? approvalQuery.error : progressQuery.error
  const isMutating =
    isStatusUpdating ||
    isItemUpdating ||
    isClaimingDelivery ||
    isCompletingDelivery

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleItemStatusChange = async (
    bookingId: string,
    itemId: string,
    status: string
  ) => {
    try {
      await updateItemProgress({ bookingId, itemId, status })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleClaimDelivery = async (bookingId: string) => {
    try {
      await claimDelivery(bookingId)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleCompleteDelivery = async (bookingId: string) => {
    try {
      await completeDelivery(bookingId)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const progressSections = isManager
    ? [
        {
          key: 'queue',
          label: 'Jarayonda',
          bookings: progressBookings.filter((booking) =>
            ['PENDING', 'PREPARING'].includes(
              String(booking.progressStatus || '').toUpperCase()
            )
          ),
        },
        {
          key: 'ready',
          label: 'Tayyor',
          bookings: progressBookings.filter(
            (booking) =>
              String(booking.progressStatus || '').toUpperCase() ===
              'READY_FOR_DELIVERY'
          ),
        },
        {
          key: 'delivering',
          label: 'Yetkazilmoqda',
          bookings: progressBookings.filter(
            (booking) =>
              String(booking.progressStatus || '').toUpperCase() === 'DELIVERING'
          ),
        },
        {
          key: 'warnings',
          label: 'Ogohlantirish',
          bookings: progressBookings.filter(
            (booking) =>
              Boolean(booking.isDelayedPreparation) ||
              Boolean(booking.isDelayedDeliveryClaim)
          ),
        },
      ]
    : isDeliveryRole
      ? [
          {
            key: 'queue',
            label: 'Navbat',
            bookings: progressBookings.filter(
              (booking) =>
                String(booking.progressStatus || '').toUpperCase() ===
                  'READY_FOR_DELIVERY' && !booking.deliveryAssignedStaffId
            ),
          },
          {
            key: 'mine',
            label: 'Menda',
            bookings: progressBookings.filter(
              (booking) =>
                String(booking.progressStatus || '').toUpperCase() ===
                  'DELIVERING' &&
                booking.deliveryAssignedStaffId === staffId
            ),
          },
          {
            key: 'history',
            label: 'Tarix',
            bookings: progressBookings.filter(
              (booking) =>
                String(booking.progressStatus || '').toUpperCase() ===
                  'DELIVERED' && booking.deliveredByStaffId === staffId
            ),
          },
        ]
      : isPreparationRole
        ? [
            {
              key: 'queue',
              label: 'Kutilmoqda',
              bookings: progressBookings.filter(
                (booking) =>
                  !isArchivedBooking(booking) &&
                  hasItemsWithStatus(booking, 'PENDING')
              ),
            },
            {
              key: 'preparing',
              label: 'Tayyorlanmoqda',
              bookings: progressBookings.filter(
                (booking) =>
                  !isArchivedBooking(booking) &&
                  hasItemsWithStatus(booking, 'PREPARING')
              ),
            },
            {
              key: 'ready',
              label: 'Tayyor',
              bookings: progressBookings.filter(
                (booking) =>
                  !isArchivedBooking(booking) &&
                  (String(booking.progressStatus || '').toUpperCase() ===
                    'READY_FOR_DELIVERY' ||
                    areAllItemsReady(booking))
              ),
            },
            {
              key: 'archive',
              label: 'Arxiv',
              bookings: progressBookings.filter((booking) =>
                isArchivedBooking(booking)
              ),
            },
          ]
        : [
            {
              key: 'all',
              label: 'Hammasi',
              bookings: progressBookings,
            },
          ]

  const activeProgressSection =
    progressSections.find((section) => section.key === progressTab) ??
    progressSections[0]
  const summaryBookings: BookingLifecycle[] = isCashier
    ? approvalBookings
    : (progressBookings as BookingLifecycle[])
  const archiveBookings: BookingLifecycle[] = isPreparationRole
    ? (progressBookings.filter((booking) =>
        isArchivedBooking(booking)
      ) as BookingLifecycle[])
    : []
  const summaryTotalAmount = summaryBookings.reduce(
    (sum: number, booking: BookingLifecycle) => sum + getBookingTotal(booking),
    0
  )
  const archiveTotalAmount = archiveBookings.reduce(
    (sum: number, booking: BookingLifecycle) => sum + getBookingTotal(booking),
    0
  )
  const summaryLabel = selectedDate ? 'Kunlik jami' : 'Jami summa'

  return (
    <div className='space-y-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>Buyurtmalar</h1>
        <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]'>
          <Input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder='ID yoki telefon orqali qidiring'
          />
          <Input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button
            type='button'
            variant='outline'
            onClick={() => setSelectedDate(getTodayDateValue())}
          >
            Bugun
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={() => setSelectedDate('')}
            disabled={!selectedDate}
          >
            Tozalash
          </Button>
        </div>
        {isCashier && search ? (
          <p className='text-sm text-muted-foreground'>
            Qidiruv natijasida faqat kutilayotgan buyurtmalar ko'rsatiladi.
          </p>
        ) : null}
      </div>

      {isLoading ? <p>Loading...</p> : null}
      {hasError ? (
        <p className='text-destructive'>Error loading bookings</p>
      ) : null}

      {!isLoading && !hasError ? (
        <div
          className={cn(
            'grid gap-3',
            isPreparationRole ? 'lg:grid-cols-3' : 'sm:grid-cols-2'
          )}
        >
          <div className='rounded-xl border border-border/60 bg-card/60 p-4'>
            <div className='text-sm text-muted-foreground'>{summaryLabel}</div>
            <div className='mt-2 text-2xl font-bold'>
              {formatMoney(summaryTotalAmount)}
            </div>
            <div className='mt-1 text-xs text-muted-foreground'>
              {selectedDate || 'Barcha sanalar'}
            </div>
          </div>
          <div className='rounded-xl border border-border/60 bg-card/60 p-4'>
            <div className='text-sm text-muted-foreground'>Jami bookinglar</div>
            <div className='mt-2 text-2xl font-bold'>{summaryBookings.length}</div>
            <div className='mt-1 text-xs text-muted-foreground'>
              Tanlangan sana va qidiruv bo`yicha
            </div>
          </div>
          {isPreparationRole ? (
            <div className='rounded-xl border border-border/60 bg-card/60 p-4'>
              <div className='text-sm text-muted-foreground'>Arxiv</div>
              <div className='mt-2 text-2xl font-bold'>
                {archiveBookings.length} ta
              </div>
              <div className='mt-1 text-xs text-muted-foreground'>
                {formatMoney(archiveTotalAmount)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {isCashier && !isLoading && !hasError ? (
        <Tabs
          value={effectiveApprovalStatus}
          onValueChange={(value) => setApprovalTab(value as ApprovalStatus)}
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
                isUpdating={isMutating}
              />
            ) : (
              <p className='text-sm text-muted-foreground'>
                {activeApprovalSection.empty}
              </p>
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      {!isCashier && !isLoading && !hasError ? (
        <Tabs
          value={activeProgressSection.key}
          onValueChange={setProgressTab}
          className='rounded-xl border border-border/60 bg-card/60 p-4'
        >
          <TabsList
            className={cn(
              'grid h-auto w-full gap-2 bg-transparent p-0',
              getProgressGridClassName(progressSections.length)
            )}
          >
            {progressSections.map((section) => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                className='border border-border/60 bg-muted/20 py-2 data-[state=active]:border-primary data-[state=active]:bg-background'
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {progressSections.map((section) => (
            <TabsContent key={section.key} value={section.key} className='mt-4 space-y-4'>
              <div>
                <h2 className='text-lg font-semibold'>{section.label}</h2>
                <p className='text-sm text-muted-foreground'>
                  {section.bookings.length} ta booking
                </p>
              </div>

              <BookingProgressList
                bookings={section.bookings}
                role={normalizedPosition}
                staffId={staffId}
                onItemStatusChange={handleItemStatusChange}
                onClaimDelivery={handleClaimDelivery}
                onCompleteDelivery={handleCompleteDelivery}
                onStatusChange={isManager ? handleStatusChange : undefined}
                isMutating={isMutating}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : null}
    </div>
  )
}
