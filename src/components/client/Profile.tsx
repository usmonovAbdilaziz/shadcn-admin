import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Clock, Package, Phone, User } from 'lucide-react'
import { useGetClientMe } from '@/hooks/client'
import { useGetClientBookings } from '@/hooks/booking'
import { useBookingRealtimeInvalidation } from '@/hooks/booking-realtime'
import {
  getBookingItemProgressLabel,
  getBookingProgressLabel,
  getBookingProgressTone,
} from '@/lib/booking-progress'
import {
  getBookingPaymentStatusLabel,
  getBookingPaymentStatusTone,
} from '@/lib/booking-payment-status'
import { cn } from '@/lib/utils'
import { useClientStore } from '@/store/use-client-store'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

type ProfileBookingItem = {
  id: string
  productId: string
  qty: number
  priceSnapshot: number
  note?: string | null
  status?: string | null
  product?: {
    name?: string | null
  } | null
}

type ProfileBooking = {
  id: string
  createdAt: string
  price?: number | string | null
  status: string
  priceStatus?: string | null
  progressStatus?: string | null
  estimatedDurationMinutes?: number
  estimatedReadyAt?: string | null
  readyForDeliveryAt?: string | null
  deliveredAt?: string | null
  deliveryAssignedName?: string | null
  table?: {
    tableNumber?: number | null
  } | null
  items?: ProfileBookingItem[]
}

const PROGRESS_STEPS = [
  'PENDING',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'DELIVERING',
  'DELIVERED',
] as const

const getProgressStepIndex = (status?: string | null) => {
  const normalized = String(status || '').toUpperCase()
  return PROGRESS_STEPS.indexOf(
    (PROGRESS_STEPS.includes(normalized as (typeof PROGRESS_STEPS)[number])
      ? normalized
      : 'PENDING') as (typeof PROGRESS_STEPS)[number]
  )
}

export const ClientProfile = () => {
  const { token, phone, logout, clientId, setClientId } = useClientStore()
  const navigate = useNavigate()
  const [now, setNow] = useState(() => Date.now())
  const meQuery = useGetClientMe(token || '')

  const resolvedClientId =
    clientId || meQuery.data?.data?.id || meQuery.data?.id || ''

  const bookingsQuery = useGetClientBookings(resolvedClientId, token)
  useBookingRealtimeInvalidation(
    [['client-bookings', resolvedClientId]],
    Boolean(resolvedClientId)
  )

  useEffect(() => {
    if (resolvedClientId && resolvedClientId !== clientId) {
      setClientId(resolvedClientId)
    }
  }, [clientId, resolvedClientId, setClientId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 30_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  if (!token) {
    return (
      <div className='mt-20 flex flex-col items-center px-4'>
        <Card className='w-full max-w-md p-6 text-center'>
          <User className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h2 className='text-xl font-bold'>Profil topilmadi</h2>
          <p className='text-muted-foreground mt-2'>
            Buyurtma berish orqali profil yaratishingiz mumkin
          </p>
          <Button
            className='mt-6 w-full'
            onClick={() => navigate({ to: '/client' })}
          >
            Menyuga qaytish
          </Button>
        </Card>
      </div>
    )
  }

  const orders = (bookingsQuery.data?.data?.items || []) as ProfileBooking[]
  const isLoading =
    meQuery.isLoading || (Boolean(resolvedClientId) && bookingsQuery.isLoading)
  const hasError = meQuery.isError || bookingsQuery.isError
  const displayPhone =
    phone ||
    meQuery.data?.data?.phone ||
    meQuery.data?.data?.phoneNumber ||
    '-'

  const getProgressHint = (order: ProfileBooking) => {
    const progressStatus = String(order.progressStatus || order.status || '').toUpperCase()

    if (progressStatus === 'DELIVERED') {
      return order.deliveredAt
        ? `Yetkazildi: ${new Date(order.deliveredAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : 'Buyurtma yetkazildi'
    }

    if (progressStatus === 'DELIVERING') {
      return order.deliveryAssignedName
        ? `${order.deliveryAssignedName} buyurtmani olib ketdi`
        : 'Buyurtma yetkazilmoqda'
    }

    if (progressStatus === 'READY_FOR_DELIVERY') {
      return 'Buyurtma tayyor, yetkazuvchi kutilmoqda'
    }

    if (progressStatus === 'CANCELLED') {
      return 'Buyurtma bekor qilingan'
    }

    const estimatedReadyAtMs = order.estimatedReadyAt
      ? new Date(order.estimatedReadyAt).getTime()
      : order.estimatedDurationMinutes
        ? new Date(order.createdAt).getTime() +
          order.estimatedDurationMinutes * 60 * 1000
        : null

    if (estimatedReadyAtMs == null) {
      return 'Jarayon davom etmoqda'
    }

    const diffMinutes = Math.round((estimatedReadyAtMs - now) / 60000)

    if (diffMinutes > 0) {
      return `Taxminan ${diffMinutes} daqiqa qoldi`
    }

    return 'Buyurtma biroz kechikmoqda'
  }

  return (
    <div className='mt-20 flex flex-col items-center px-4 pb-20'>
      <div className='w-full max-w-2xl'>
        <div className='mb-6 flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/client' })}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' /> Ortga
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              logout()
              navigate({ to: '/client' })
            }}
            className='text-destructive'
          >
            Chiqish
          </Button>
        </div>

        <Card className='from-primary/5 to-primary/10 border-primary/20 mb-8 bg-gradient-to-br p-6'>
          <div className='flex items-center gap-4'>
            <div className='bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full'>
              <User className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>Mijoz Profili</h1>
              <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                <Phone className='h-3 w-3' /> {displayPhone}
              </div>
            </div>
          </div>
        </Card>

        <h2 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <Package className='h-5 w-5' /> Buyurtmalar tarixi
        </h2>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className='bg-muted h-32 w-full animate-pulse rounded-xl'
              />
            ))}
          </div>
        ) : hasError ? (
          <Card className='p-8 text-center text-destructive'>
            Buyurtmalarni yuklashda xatolik
          </Card>
        ) : orders.length === 0 ? (
          <Card className='text-muted-foreground p-8 text-center'>
            Hali buyurtmalar mavjud emas
          </Card>
        ) : (
          <Accordion type='multiple' className='space-y-4'>
            {orders.map((order) => {
              const total =
                Number(
                  order.price ??
                    (order.items || []).reduce(
                      (sum: number, item: ProfileBookingItem) =>
                        sum + item.priceSnapshot * item.qty,
                      0
                    )
                ) || 0

              return (
                <AccordionItem
                  key={order.id}
                  value={order.id}
                  className='border-0'
                >
                  <Card className='p-0 transition-shadow hover:shadow-md'>
                    <AccordionTrigger className='px-4 py-4 hover:no-underline'>
                      <div className='flex w-full items-start justify-between gap-4'>
                        <div className='text-left'>
                          <span className='text-muted-foreground text-xs'>
                            ID: {order.id.substring(0, 8)}
                          </span>

                          <p className='mt-1 text-sm font-semibold'>
                            {new Date(order.createdAt).toLocaleDateString()}{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>

                          <div className='text-muted-foreground mt-2 flex items-center gap-2 text-xs'>
                            <Clock className='h-3 w-3' /> Stol #
                            {order.table?.tableNumber}
                          </div>
                        </div>

                        <div className='flex shrink-0 flex-col items-end gap-2'>
                          <Badge
                            variant='outline'
                            className={cn(
                              'border',
                              getBookingProgressTone(order.progressStatus || order.status)
                            )}
                          >
                            {getBookingProgressLabel(order.progressStatus || order.status)}
                          </Badge>
                          <Badge
                            variant='outline'
                            className={cn(
                              'border',
                              getBookingPaymentStatusTone(order.priceStatus)
                            )}
                          >
                            {getBookingPaymentStatusLabel(order.priceStatus)}
                          </Badge>

                          <div className='text-lg font-bold'>{total} so'm</div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className='px-4 pb-4'>
                      <div className='rounded-xl border border-border/60 bg-muted/20 p-3'>
                        <div className='text-xs text-muted-foreground'>
                          Jarayon holati
                        </div>
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {PROGRESS_STEPS.map((step, index) => {
                            const currentIndex = getProgressStepIndex(
                              order.progressStatus || order.status
                            )
                            const isActive = index <= currentIndex

                            return (
                              <div
                                key={step}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-xs',
                                  isActive
                                    ? 'border-primary/40 bg-primary/15 text-primary'
                                    : 'border-border/60 bg-background/40 text-muted-foreground'
                                )}
                              >
                                {getBookingProgressLabel(step)}
                              </div>
                            )
                          })}
                        </div>
                        <div className='mt-3 text-sm text-muted-foreground'>
                          {getProgressHint(order)}
                        </div>
                        <div className='mt-2 text-sm text-muted-foreground'>
                          To'lov holati:{' '}
                          <span className='font-medium text-foreground'>
                            {getBookingPaymentStatusLabel(order.priceStatus)}
                          </span>
                        </div>
                      </div>

                      <div className='mt-2 space-y-1 border-t pt-3'>
                        {order.items?.map((item: ProfileBookingItem) => (
                          <div
                            key={item.id}
                            className='flex items-start justify-between gap-3 text-sm'
                          >
                            <div className='min-w-0'>
                              <div className='text-muted-foreground'>
                                {item.product?.name || item.productId} x{item.qty}
                              </div>
                              {item.status ? (
                                <div className='mt-1 text-xs text-muted-foreground'>
                                  Holat: {getBookingItemProgressLabel(item.status)}
                                </div>
                              ) : null}
                              {item.note ? (
                                <div className='text-muted-foreground mt-1 whitespace-pre-wrap text-xs'>
                                  Izoh: {item.note}
                                </div>
                              ) : null}
                            </div>
                            <span>{item.priceSnapshot * item.qty} so'm</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>
    </div>
  )
}
