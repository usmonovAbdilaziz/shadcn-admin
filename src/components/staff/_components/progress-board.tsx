import dayjs from 'dayjs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  getBookingItemProgressLabel,
  getBookingItemProgressTone,
  getBookingProgressLabel,
  getBookingProgressTone,
  getResponsibleRoleLabel,
} from '@/lib/booking-progress'
import {
  canConfirmBookingApproval,
  canMarkBookingApprovalPaid,
  getBookingApprovalStage,
} from '@/lib/booking-approval-status'
import {
  getBookingPaymentStatusLabel,
  getBookingPaymentStatusTone,
  isBookingPaid,
} from '@/lib/booking-payment-status'
import { normalizeStaffPosition } from '@/lib/staff-position'

export type BookingProgressItem = {
  id: string
  productId: string
  qty: number
  priceSnapshot: number
  note?: string | null
  status?: string | null
  responsiblePosition?: string | null
  product?: {
    name?: string | null
  } | null
}

export type BookingProgressCard = {
  id: string
  status: string
  priceStatus?: string | null
  progressStatus?: string | null
  createdAt: string
  readyForDeliveryAt?: string | null
  deliveredAt?: string | null
  deliveryAssignedStaffId?: string | null
  deliveryAssignedRole?: string | null
  deliveryAssignedName?: string | null
  deliveredByName?: string | null
  deliveredByRole?: string | null
  estimatedDurationMinutes?: number
  estimatedReadyAt?: string | null
  isDelayedPreparation?: boolean
  isDelayedDeliveryClaim?: boolean
  deliveredByStaffId?: string | null
  price?: string | number | null
  notes?: string | null
  items?: BookingProgressItem[]
  client?: {
    fullName?: string | null
    phoneNumber?: string | null
  } | null
  table?: {
    tableNumber?: number | null
    tableColumns?: string | null
  } | null
}

const formatMoney = (value?: number | string | null) =>
  `${Number(value ?? 0).toLocaleString('uz-UZ')} so'm`

const getLegacyActions = (booking: {
  status?: string | null
  priceStatus?: string | null
  progressStatus?: string | null
}) => {
  if (canConfirmBookingApproval(booking)) {
    return [
      { label: 'Tasdiqlash', status: 'CONFIRMED' },
      { label: 'Bekor qilish', status: 'CANCELLED' },
    ]
  }

  if (canMarkBookingApprovalPaid(booking)) {
    return [
      { label: "To'landi", status: 'COMPLETED' },
      { label: 'Bekor qilish', status: 'CANCELLED' },
    ]
  }

  return []
}

export function BookingProgressList({
  bookings,
  role,
  staffId,
  onItemStatusChange,
  onClaimDelivery,
  onCompleteDelivery,
  onStatusChange,
  isMutating,
}: {
  bookings: BookingProgressCard[]
  role: string
  staffId?: string | null
  onItemStatusChange?: (
    bookingId: string,
    itemId: string,
    status: string
  ) => void | Promise<void>
  onClaimDelivery?: (bookingId: string) => void | Promise<void>
  onCompleteDelivery?: (bookingId: string) => void | Promise<void>
  onStatusChange?: (bookingId: string, status: string) => void | Promise<void>
  isMutating?: boolean
}) {
  const normalizedRole = normalizeStaffPosition(role)
  const isPreparationRole =
    normalizedRole === 'COOK' || normalizedRole === 'BARMEN'
  const isDeliveryRole =
    normalizedRole === 'WAITER' || normalizedRole === 'RUNNER'
  const isManager = normalizedRole === 'MANAGER'

  if (bookings.length === 0) {
    return (
      <Card className='border-border/60 bg-card/50 p-6 text-sm text-muted-foreground'>
        Buyurtma topilmadi
      </Card>
    )
  }

  return (
    <Accordion type='multiple' className='space-y-4'>
      {bookings.map((booking) => {
        const total =
          Number(
            booking.price ??
              (booking.items || []).reduce(
                (sum, item) => sum + item.priceSnapshot * item.qty,
                0
              )
          ) || 0
        const approvalStage = getBookingApprovalStage(booking)
        const legacyActions = isManager ? getLegacyActions(booking) : []
        const canClaimDelivery =
          isDeliveryRole &&
          booking.progressStatus === 'READY_FOR_DELIVERY' &&
          !booking.deliveryAssignedStaffId
        const canCompleteDelivery =
          isDeliveryRole &&
          booking.progressStatus === 'DELIVERING' &&
          booking.deliveryAssignedStaffId === staffId
        const isFinalizedBooking =
          booking.status === 'COMPLETED' ||
          booking.status === 'CANCELLED' ||
          booking.progressStatus === 'DELIVERED' ||
          booking.progressStatus === 'CANCELLED'

        return (
          <AccordionItem
            key={booking.id}
            value={booking.id}
            className='rounded-xl border border-border/60 bg-card/60 px-5 last:border-b'
          >
            <AccordionTrigger className='py-5 hover:no-underline'>
              <div className='flex w-full flex-col gap-4 pr-4 text-left lg:flex-row lg:items-start lg:justify-between'>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h3 className='text-lg font-semibold'>
                      {booking.client?.fullName || 'Noma`lum mijoz'}
                    </h3>
                    <Badge
                      variant='outline'
                      className={cn(
                        'border',
                        getBookingProgressTone(booking.progressStatus)
                      )}
                    >
                      {getBookingProgressLabel(booking.progressStatus)}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={cn(
                        'border',
                        getBookingApprovalStage(booking) === 'PENDING' &&
                          canMarkBookingApprovalPaid(booking)
                          ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                          : getBookingPaymentStatusTone(booking.priceStatus)
                      )}
                    >
                      {approvalStage === 'PENDING' &&
                      canMarkBookingApprovalPaid(booking)
                        ? 'To`lov kutilmoqda'
                        : getBookingPaymentStatusLabel(booking.priceStatus)}
                    </Badge>
                    {booking.isDelayedPreparation ? (
                      <Badge className='bg-rose-500/15 text-rose-200'>
                        Tayyorlov kechikdi
                      </Badge>
                    ) : null}
                    {booking.isDelayedDeliveryClaim ? (
                      <Badge className='bg-rose-500/15 text-rose-200'>
                        Yetkazish olinmagan
                      </Badge>
                    ) : null}
                  </div>

                  <div className='text-sm text-muted-foreground'>
                    {booking.client?.phoneNumber || '-'} | Stol{' '}
                    {booking.table?.tableColumns || '-'}-
                    {booking.table?.tableNumber ?? '-'}
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-2xl font-bold'>{formatMoney(total)}</div>
                  <div className='text-xs text-muted-foreground'>
                    #{booking.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className='pb-5'>
              <div className='grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4'>
                <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                  <div className='text-xs text-muted-foreground'>Yaratilgan</div>
                  <div className='mt-1 font-medium'>
                    {dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>

                <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                  <div className='text-xs text-muted-foreground'>
                    Taxminiy tayyor
                  </div>
                  <div className='mt-1 font-medium'>
                    {booking.estimatedReadyAt
                      ? dayjs(booking.estimatedReadyAt).format('HH:mm')
                      : `${booking.estimatedDurationMinutes || 0} daqiqa`}
                  </div>
                </div>

                <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                  <div className='text-xs text-muted-foreground'>Yetkazuvchi</div>
                  <div className='mt-1 font-medium'>
                    {booking.deliveryAssignedName || '-'}
                  </div>
                  {booking.deliveryAssignedRole ? (
                    <div className='text-xs text-muted-foreground'>
                      {getResponsibleRoleLabel(booking.deliveryAssignedRole)}
                    </div>
                  ) : null}
                </div>

                <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                  <div className='text-xs text-muted-foreground'>Yetkazildi</div>
                  <div className='mt-1 font-medium'>
                    {booking.deliveredAt
                      ? dayjs(booking.deliveredAt).format('YYYY-MM-DD HH:mm')
                      : '-'}
                  </div>
                  {booking.deliveredByName ? (
                    <div className='text-xs text-muted-foreground'>
                      {booking.deliveredByName}
                    </div>
                  ) : null}
                  <div className='mt-2 text-xs text-muted-foreground'>
                    {isBookingPaid(booking.priceStatus)
                      ? "To'lov yopilgan"
                      : "To'lov hali yopilmagan"}
                  </div>
                </div>
              </div>

              {booking.notes ? (
                <div className='mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm'>
                  <div className='text-xs text-muted-foreground'>Izoh</div>
                  <div className='mt-1 whitespace-pre-wrap'>{booking.notes}</div>
                </div>
              ) : null}

              <Separator className='my-4' />

              <div className='space-y-3'>
                {(booking.items || []).map((item) => {
                  const itemTotal = item.priceSnapshot * item.qty
                  const responsibleRole = normalizeStaffPosition(
                    item.responsiblePosition
                  )
                  const canControlItem =
                    isPreparationRole &&
                    responsibleRole === normalizedRole &&
                    !isFinalizedBooking

                  return (
                    <div
                      key={item.id}
                      className='rounded-lg border border-border/60 bg-background/40 p-3'
                    >
                      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-medium'>
                              {item.product?.name || item.productId}
                            </span>
                            <Badge
                              variant='outline'
                              className={cn(
                                'border',
                                getBookingItemProgressTone(item.status)
                              )}
                            >
                              {getBookingItemProgressLabel(item.status)}
                            </Badge>
                            {responsibleRole ? (
                              <Badge variant='secondary'>
                                {getResponsibleRoleLabel(responsibleRole)}
                              </Badge>
                            ) : null}
                          </div>
                          <div className='mt-1 text-xs text-muted-foreground'>
                            {item.qty} x {formatMoney(item.priceSnapshot)} ={' '}
                            {formatMoney(itemTotal)}
                          </div>
                          {item.note ? (
                            <div className='mt-1 whitespace-pre-wrap text-xs text-muted-foreground'>
                              Izoh: {item.note}
                            </div>
                          ) : null}
                        </div>

                        {canControlItem ? (
                          <div className='flex flex-wrap gap-2'>
                            {item.status === 'PENDING' ? (
                              <Button
                                type='button'
                                size='sm'
                                variant='outline'
                                disabled={isMutating}
                                onClick={() => {
                                  void onItemStatusChange?.(
                                    booking.id,
                                    item.id,
                                    'PREPARING'
                                  )
                                }}
                              >
                                Boshlash
                              </Button>
                            ) : null}
                            {item.status !== 'READY' &&
                            item.status !== 'CANCELLED' ? (
                              <Button
                                type='button'
                                size='sm'
                                disabled={isMutating}
                                onClick={() => {
                                  void onItemStatusChange?.(
                                    booking.id,
                                    item.id,
                                    'READY'
                                  )
                                }}
                              >
                                Tayyor
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              {(canClaimDelivery ||
                canCompleteDelivery ||
                legacyActions.length > 0) && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {canClaimDelivery ? (
                    <Button
                      type='button'
                      disabled={isMutating}
                      onClick={() => {
                        void onClaimDelivery?.(booking.id)
                      }}
                    >
                      Yetkazishni olish
                    </Button>
                  ) : null}

                  {canCompleteDelivery ? (
                    <Button
                      type='button'
                      disabled={isMutating}
                      onClick={() => {
                        void onCompleteDelivery?.(booking.id)
                      }}
                    >
                      Yetkazildi
                    </Button>
                  ) : null}

                  {legacyActions.map((action) => (
                    <Button
                      key={action.status}
                      type='button'
                      variant='outline'
                      disabled={isMutating}
                      onClick={() => {
                        void onStatusChange?.(booking.id, action.status)
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
