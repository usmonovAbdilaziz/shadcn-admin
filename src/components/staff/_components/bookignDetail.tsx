import dayjs from 'dayjs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  getBookingConfirmerSummary,
  getBookingConfirmerTypeLabel,
} from '@/lib/booking-confirmer'
import { getBookingStatusLabel, getBookingStatusTone } from '@/lib/booking-status'
import { cn } from '@/lib/utils'

type BookingItem = {
  id: string
  qty: number
  priceSnapshot: number
  createdAt?: string
  note?: string | null
  product?: {
    name?: string
    price?: number
  }
}

export type Booking = {
  id: string
  status: string
  createdAt?: string
  notes?: string
  price?: string
  confirmedAt?: string | null
  confirmedByType?: string | null
  confirmedByName?: string | null
  client?: {
    fullName?: string
    phoneNumber?: string
  }
  service?: {
    name?: string
    duration?: number
    price?: number
  }
  table?: {
    tableColumns?: string
    tableNumber?: number
  }
  items?: BookingItem[]
}

const formatMoney = (value?: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value ?? 0
  return new Intl.NumberFormat('uz-UZ').format(Number.isFinite(num) ? num : 0)
}

export function BookingList({
  bookings,
  canUpdateStatus,
  onStatusChange,
  isUpdating,
}: {
  bookings: Booking[]
  canUpdateStatus?: boolean
  onStatusChange?: (id: string, status: string) => void | Promise<void>
  isUpdating?: boolean
}) {
  return (
    <Accordion type='single' collapsible className='w-full space-y-3'>
      {bookings.map((booking) => {
        const itemsTotal =
          booking.items?.reduce(
            (sum, item) => sum + item.priceSnapshot * item.qty,
            0
          ) ?? 0
        const total = booking.price ?? itemsTotal ?? booking.service?.price ?? 0
        const status = String(booking.status || '').toUpperCase()
        const canAct = Boolean(canUpdateStatus && onStatusChange)
        const confirmerSummary = getBookingConfirmerSummary(booking)
        const confirmerTypeLabel = getBookingConfirmerTypeLabel(
          booking.confirmedByType
        )

        const actions: Array<{ label: string; status: string }> = []
        if (status === 'PENDING') {
          actions.push({ label: 'Tasdiqlash', status: 'CONFIRMED' })
          actions.push({ label: 'Bekor qilish', status: 'CANCELLED' })
        } else if (status === 'CONFIRMED') {
          actions.push({ label: 'Tasdiqlandi', status: 'COMPLETED' })
          actions.push({ label: 'Bekor qilish', status: 'CANCELLED' })
        }

        return (
          <AccordionItem key={booking.id} value={booking.id}>
            <AccordionTrigger className='hover:no-underline'>
              <div className='flex w-full items-center justify-between gap-4 text-left'>
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-base font-semibold'>
                    {booking.client?.fullName || 'Unknown client'}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {booking.client?.phoneNumber || '-'} | Stol{' '}
                    {booking.table?.tableColumns || '-'}-
                    {booking.table?.tableNumber ?? '-'}
                  </span>
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      getBookingStatusTone(booking.status)
                    )}
                  >
                    {getBookingStatusLabel(booking.status)}
                  </span>
                  {confirmerSummary ? (
                    <span className='max-w-[220px] truncate text-[11px] text-muted-foreground'>
                      {confirmerSummary}
                    </span>
                  ) : null}
                  <span className='text-base font-semibold'>
                    {formatMoney(total)} so'm
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className='grid gap-4 text-sm md:grid-cols-[1.2fr_1fr]'>
                <div className='space-y-3'>
                  <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                    <div className='text-xs text-muted-foreground'>
                      Buyurtma ID
                    </div>
                    <div className='break-all font-mono text-xs'>{booking.id}</div>
                  </div>

                  <div className='grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>Mijoz</span>
                      <span className='font-medium'>
                        {booking.client?.fullName || '-'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>Telefon</span>
                      <span className='font-medium'>
                        {booking.client?.phoneNumber || '-'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>Stol</span>
                      <span className='font-medium'>
                        {booking.table?.tableColumns || '-'}-
                        {booking.table?.tableNumber ?? '-'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>Vaqt</span>
                      <span className='font-medium'>
                        {booking.createdAt
                          ? dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm')
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {booking.notes ? (
                    <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                      <div className='text-xs text-muted-foreground'>Izoh</div>
                      <div className='mt-1 whitespace-pre-wrap text-sm'>
                        {booking.notes}
                      </div>
                    </div>
                  ) : null}

                  {confirmerSummary ? (
                    <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                      <div className='text-xs text-muted-foreground'>Tasdiqlagan</div>
                      <div className='mt-1 flex items-center justify-between gap-3'>
                        <span className='font-medium'>
                          {booking.confirmedByName || '-'}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {confirmerTypeLabel || '-'}
                        </span>
                      </div>
                      {booking.confirmedAt ? (
                        <div className='mt-1 text-xs text-muted-foreground'>
                          {dayjs(booking.confirmedAt).format('YYYY-MM-DD HH:mm')}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                  <div className='mb-2 text-xs text-muted-foreground'>Itemlar</div>
                  <div className='space-y-2'>
                    {(booking.items || []).map((item) => {
                      const itemTotal = item.priceSnapshot * item.qty

                      return (
                        <div
                          key={item.id}
                          className='flex items-start justify-between gap-2 text-sm'
                        >
                          <div className='min-w-0'>
                            <div className='truncate font-medium'>
                              {item.product?.name || "Noma'lum"}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {item.qty} x {formatMoney(item.priceSnapshot)} so'm
                              {item.note ? ` | ${item.note}` : ''}
                            </div>
                          </div>
                          <div className='shrink-0 text-right font-semibold'>
                            <div>{formatMoney(itemTotal)} so'm</div>
                            <span className='text-[10px] text-gray-300'>
                              {item.createdAt
                                ? dayjs(item.createdAt).format('HH:mm DD-MM-YYYY')
                                : '-'}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {(booking.items || []).length === 0 ? (
                      <div className='text-xs text-muted-foreground'>
                        Itemlar yo'q
                      </div>
                    ) : null}
                  </div>

                  <div className='mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm'>
                    <span className='text-xs text-muted-foreground'>Jami</span>
                    <span className='text-base font-semibold'>
                      {formatMoney(total)} so'm
                    </span>
                  </div>

                  {canAct && actions.length > 0 ? (
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          type='button'
                          disabled={isUpdating}
                          onClick={() => onStatusChange?.(booking.id, action.status)}
                          className='rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-60'
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
