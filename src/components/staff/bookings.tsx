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
import { getBookingApprovalStage } from '@/lib/booking-approval-status'
import { normalizeStaffPosition } from '@/lib/staff-position'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const APPROVAL_SECTIONS = [
  {
    key: 'PENDING',
    title: 'Kutilmoqda',
    empty: 'Kutilayotgan buyurtma yo`q',
    filters: {
      status: 'PENDING',
    },
  },
  {
    key: 'CONFIRMED',
    title: 'Tasdiqlangan',
    empty: 'Tasdiqlangan buyurtma yo`q',
    filters: {
      status: 'CONFIRMED',
      priceStatus: 'PENDING',
    },
  },
  {
    key: 'PAID',
    title: "To'landi",
    empty: "To'langan buyurtma yo`q",
    filters: {
      priceStatus: 'COMPLETED',
    },
  },
  {
    key: 'CANCELLED',
    title: 'Bekor qilingan',
    empty: 'Bekor qilingan buyurtma yo`q',
    filters: {
      status: 'CANCELLED',
    },
  },
] as const

const CASHIER_SECTIONS = [
  {
    key: 'PENDING',
    title: "To'lov kutilmoqda",
    empty: "To'lov kutilayotgan buyurtma yo`q",
  },
  {
    key: 'PAID',
    title: "To'landi",
    empty: "To'langan buyurtma yo`q",
  },
  {
    key: 'CANCELLED',
    title: 'Bekor qilingan',
    empty: 'Bekor qilingan buyurtma yo`q',
  },
] as const

type ApprovalStatus = (typeof APPROVAL_SECTIONS)[number]['key']

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
  priceStatus?: string | null
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
  const approvalSections = isCashier ? CASHIER_SECTIONS : APPROVAL_SECTIONS
  const activeApprovalSection =
    approvalSections.find((section) => section.key === approvalTab) ??
    approvalSections[0]

  const approvalQuery = useGetStaffBookings(isCashier ? position : '', {
    search,
    ...dayRange,
    ...(isCashier
      ? {
          progressStatus:
            activeApprovalSection.key === 'CANCELLED'
              ? 'CANCELLED'
              : 'DELIVERED',
        }
      : {}),
  })
  const progressQuery = useGetStaffBookings(!isCashier ? position : '', {
    search,
    ...dayRange,
  })

  const rawApprovalBookings = (approvalQuery.data?.data?.items || []) as ApprovalBooking[]
  const approvalBookings = rawApprovalBookings.filter((booking) => {
    const stage = getBookingApprovalStage(booking)
    const progressStatus = String(booking.progressStatus || '').toUpperCase()
    const isDelivered = progressStatus === 'DELIVERED'
    const isCancelled = progressStatus === 'CANCELLED'

    if (search.length > 0) {
      return stage === 'PENDING' && isDelivered
    }

    if (activeApprovalSection.key === 'CANCELLED') {
      return stage === 'CANCELLED' || isCancelled
    }

    return stage === activeApprovalSection.key && isDelivered
  })
  const progressBookings = (progressQuery.data?.data?.items || []) as BookingProgressCard[]
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
        {
          key: 'payment',
          label: "To'lov kutilmoqda",
          bookings: progressBookings.filter(
            (booking) =>
              String(booking.progressStatus || '').toUpperCase() ===
                'DELIVERED' &&
              String(booking.priceStatus || '').toUpperCase() !== 'COMPLETED' &&
              String(booking.status || '').toUpperCase() !== 'CANCELLED'
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
            Qidiruv natijasida faqat yetkazilgan va to'lovi kutilayotgan
            buyurtmalar ko'rsatiladi.
          </p>
        ) : null}
      </div>

      {isLoading ? <p>Loading...</p> : null}
      {hasError ? (
        <p className='text-destructive'>Error loading bookings</p>
      ) : null}

    

      {isCashier && !isLoading && !hasError ? (
        <Tabs
          value={activeApprovalSection.key}
          onValueChange={(value) => setApprovalTab(value as ApprovalStatus)}
          className='rounded-xl border border-border/60 bg-card/60 p-4'
        >
          <TabsList className='grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-3'>
            {approvalSections.map((section) => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                disabled={Boolean(search) && section.key !== 'PENDING'}
                className='border border-border/60 bg-muted/20 py-2 data-[state=active]:border-primary data-[state=active]:bg-background'
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeApprovalSection.key} className='mt-4 space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>{activeApprovalSection.title}</h2>
              <p className='text-sm text-muted-foreground'>
                {approvalBookings.length} ta
              </p>
            </div>

            {approvalBookings.length > 0 ? (
              <BookingList
                bookings={approvalBookings}
                canUpdateStatus
                onStatusChange={handleStatusChange}
                isUpdating={isMutating}
                showProgressAsPrimaryStatus
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
                  {section.bookings.length} ta
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
