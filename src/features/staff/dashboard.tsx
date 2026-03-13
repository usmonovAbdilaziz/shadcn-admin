import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  getStaffPositionLabel,
  normalizeStaffPosition,
} from '@/lib/staff-position'
import {
  useBookingRealtimeInvalidation,
  useBusinessBookingRoom,
} from '@/hooks/booking-realtime'
import { useGetStaffBookings } from '@/hooks/staff'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getBookingApprovalStage } from '@/lib/booking-approval-status'

type StaffUser = {
  id?: string | null
  staffId?: string | null
  position?: string | null
  businessId?: string | null
  business?: {
    id?: string | null
  } | null
}

type DashboardBooking = {
  id: string
  status?: string | null
  priceStatus?: string | null
  progressStatus?: string | null
  createdAt?: string | null
  price?: string | number | null
  deliveryAssignedStaffId?: string | null
  deliveredByStaffId?: string | null
  isDelayedPreparation?: boolean
  isDelayedDeliveryClaim?: boolean
  client?: {
    fullName?: string | null
  } | null
  items?: Array<{
    qty: number
    priceSnapshot: number
    status?: string | null
  }> | null
}

type MetricCard = {
  title: string
  value: string
  description: string
}

const getStoredStaff = (): StaffUser => {
  try {
    const parsed = JSON.parse(localStorage.getItem('user') || '{}') as unknown
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as StaffUser)
      : {}
  } catch {
    return {}
  }
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

const formatMoney = (value: number) => `${value.toLocaleString('uz-UZ')} so'm`

const getBookingTotal = (booking: DashboardBooking) =>
  Number(
    booking.price ??
      booking.items?.reduce(
        (sum, item) =>
          sum + Number(item.priceSnapshot || 0) * Number(item.qty || 0),
        0
      ) ??
      0
  ) || 0

const hasItemsWithStatus = (booking: DashboardBooking, status: string) =>
  (booking.items || []).some(
    (item) => String(item.status || '').toUpperCase() === status
  )

const isArchivedBooking = (booking: DashboardBooking) => {
  const status = String(booking.status || '').toUpperCase()
  const progressStatus = String(booking.progressStatus || '').toUpperCase()

  return (
    status === 'COMPLETED' ||
    status === 'CANCELLED' ||
    progressStatus === 'DELIVERED' ||
    progressStatus === 'CANCELLED'
  )
}

const areAllItemsReady = (booking: DashboardBooking) => {
  const items = booking.items || []
  return (
    items.length > 0 &&
    items.every((item) => {
      const status = String(item.status || '').toUpperCase()
      return status === 'READY' || status === 'CANCELLED'
    })
  )
}

const buildMetricCards = ({
  bookings,
  position,
  staffId,
  selectedDate,
}: {
  bookings: DashboardBooking[]
  position: string
  staffId?: string | null
  selectedDate: string
}): MetricCard[] => {
  const normalizedPosition =
    normalizeStaffPosition(position) || position.toUpperCase()
  const metricSourceBookings =
    normalizedPosition === 'CASHIER'
      ? bookings.filter((booking) => {
          const progressStatus = String(booking.progressStatus || '').toUpperCase()
          return progressStatus === 'DELIVERED' || progressStatus === 'CANCELLED'
        })
      : bookings
  const totalAmount = metricSourceBookings.reduce(
    (sum, booking) => sum + getBookingTotal(booking),
    0
  )

  const cards: MetricCard[] = [
    {
      title: selectedDate ? 'Kunlik jami' : 'Jami summa',
      value: formatMoney(totalAmount),
      description: selectedDate || 'Barcha sanalar',
    },
    {
      title: 'Jami bookinglar',
      value: `${metricSourceBookings.length} ta`,
      description: 'Tanlangan sana va rol bo`yicha',
    },
  ]

  if (normalizedPosition === 'MANAGER') {
    const inProgress = bookings.filter((booking) =>
      ['PENDING', 'PREPARING'].includes(
        String(booking.progressStatus || '').toUpperCase()
      )
    )
    const ready = bookings.filter(
      (booking) =>
        String(booking.progressStatus || '').toUpperCase() ===
        'READY_FOR_DELIVERY'
    )
    const delivering = bookings.filter(
      (booking) =>
        String(booking.progressStatus || '').toUpperCase() === 'DELIVERING'
    )
    const warnings = bookings.filter(
      (booking) =>
        Boolean(booking.isDelayedPreparation) ||
        Boolean(booking.isDelayedDeliveryClaim)
    )

    cards.push(
      {
        title: 'Jarayonda',
        value: `${inProgress.length} ta`,
        description: formatMoney(
          inProgress.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Tayyor',
        value: `${ready.length} ta`,
        description: formatMoney(
          ready.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Yetkazilmoqda',
        value: `${delivering.length} ta`,
        description: formatMoney(
          delivering.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Ogohlantirish',
        value: `${warnings.length} ta`,
        description: 'Kechikkan jarayonlar',
      }
    )
  } else if (normalizedPosition === 'CASHIER') {
    const cashierBookings = metricSourceBookings
    const pending = cashierBookings.filter(
      (booking) => getBookingApprovalStage(booking) === 'PENDING'
    )
    const paid = cashierBookings.filter(
      (booking) => getBookingApprovalStage(booking) === 'PAID'
    )
    const cancelled = cashierBookings.filter(
      (booking) => getBookingApprovalStage(booking) === 'CANCELLED'
    )

    cards.push(
      {
        title: "To'lov kutilmoqda",
        value: `${pending.length} ta`,
        description: formatMoney(
          pending.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: "To'langan",
        value: `${paid.length} ta`,
        description: formatMoney(
          paid.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Bekor qilingan',
        value: `${cancelled.length} ta`,
        description: formatMoney(
          cancelled.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      }
    )
  } else if (
    normalizedPosition === 'WAITER' ||
    normalizedPosition === 'RUNNER'
  ) {
    const queue = bookings.filter(
      (booking) =>
        String(booking.progressStatus || '').toUpperCase() ===
          'READY_FOR_DELIVERY' && !booking.deliveryAssignedStaffId
    )
    const mine = bookings.filter(
      (booking) =>
        String(booking.progressStatus || '').toUpperCase() === 'DELIVERING' &&
        booking.deliveryAssignedStaffId === staffId
    )
    const history = bookings.filter(
      (booking) =>
        String(booking.progressStatus || '').toUpperCase() === 'DELIVERED' &&
        booking.deliveredByStaffId === staffId
    )

    cards.push(
      {
        title: 'Navbat',
        value: `${queue.length} ta`,
        description: formatMoney(
          queue.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Menda',
        value: `${mine.length} ta`,
        description: formatMoney(
          mine.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Tarix',
        value: `${history.length} ta`,
        description: formatMoney(
          history.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      }
    )
  } else if (normalizedPosition === 'COOK' || normalizedPosition === 'BARMEN') {
    const pending = bookings.filter(
      (booking) =>
        !isArchivedBooking(booking) && hasItemsWithStatus(booking, 'PENDING')
    )
    const preparing = bookings.filter(
      (booking) =>
        !isArchivedBooking(booking) && hasItemsWithStatus(booking, 'PREPARING')
    )
    const ready = bookings.filter(
      (booking) =>
        !isArchivedBooking(booking) &&
        (String(booking.progressStatus || '').toUpperCase() ===
          'READY_FOR_DELIVERY' ||
          areAllItemsReady(booking))
    )
    const archive = bookings.filter((booking) => isArchivedBooking(booking))

    cards.push(
      {
        title: 'Kutilmoqda',
        value: `${pending.length} ta`,
        description: formatMoney(
          pending.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Tayyorlanmoqda',
        value: `${preparing.length} ta`,
        description: formatMoney(
          preparing.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Tayyor',
        value: `${ready.length} ta`,
        description: formatMoney(
          ready.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Arxiv',
        value: `${archive.length} ta`,
        description: formatMoney(
          archive.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      }
    )
  } else {
    const active = bookings.filter((booking) => !isArchivedBooking(booking))
    const archive = bookings.filter((booking) => isArchivedBooking(booking))

    cards.push(
      {
        title: 'Aktiv',
        value: `${active.length} ta`,
        description: formatMoney(
          active.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      },
      {
        title: 'Arxiv',
        value: `${archive.length} ta`,
        description: formatMoney(
          archive.reduce((sum, booking) => sum + getBookingTotal(booking), 0)
        ),
      }
    )
  }

  return cards
}

export function StaffDashboard() {
  const navigate = useNavigate()
  const staff = getStoredStaff()
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue())

  const position = String(staff.position || '')
  const normalizedPosition =
    normalizeStaffPosition(position) || position.toUpperCase()
  const positionLabel = getStaffPositionLabel(position) || 'Staff'
  const businessId = staff.businessId || staff.business?.id || null
  const staffId = staff.staffId || staff.id || null
  const dayRange = getDayRange(selectedDate)

  const dashboardQuery = useGetStaffBookings(position, dayRange) as {
    data?: {
      data?: {
        items?: DashboardBooking[]
      }
    }
    isLoading: boolean
    error: unknown
  }
  const bookings = dashboardQuery.data?.data?.items ?? []
  const metricCards = buildMetricCards({
    bookings,
    position: normalizedPosition,
    staffId,
    selectedDate,
  })
  useBusinessBookingRoom(businessId)
  useBookingRealtimeInvalidation([['staff-bookings']], Boolean(position))

  return (
    <div className='space-y-6 p-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{positionLabel} Dashboard</h1>
          <p className='text-muted-foreground text-sm'>
            Realtime statistika va role bo`yicha tezkor holatlar
          </p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Input
            type='date'
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className='sm:w-[220px]'
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
            disabled={!selectedDate}
            onClick={() => setSelectedDate('')}
          >
            Tozalash
          </Button>
          <Button
            type='button'
            onClick={() => {
              void navigate({ to: '/staff/bookings' })
            }}
          >
            Buyurtmalarga o`tish
          </Button>
        </div>
      </div>

      {dashboardQuery.isLoading ? <p>Loading...</p> : null}
      {dashboardQuery.error ? (
        <p className='text-destructive'>Error loading dashboard</p>
      ) : null}

      {!dashboardQuery.isLoading && !dashboardQuery.error ? (
        <>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {metricCards.map((card) => (
              <Card
                key={card.title}
                className='border-border/60 bg-card/60 py-2 shadow-none'
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 pb-6'>
                  <div className='text-2xl font-bold'>{card.value}</div>
                  <p className='text-muted-foreground text-sm'>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
