import { useEffect, useRef, useState } from 'react'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Package,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateBooking } from '@/hooks/booking'
import { useSocket } from '@/context/socket-context'
import { useCartStore } from '@/store/use-cart-store'
import { useClientStore } from '@/store/use-client-store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Modal } from '../ui/modal'

interface KarzinkaProps {
  services: any
  onBack: () => void
  onOrder: () => void
}

export const Karzinka = ({ onBack, onOrder }: KarzinkaProps) => {
  const {
    items: cartItems,
    updateQty,
    removeFromCart,
    totalPrice,
    totalItems,
  } = useCartStore()
  const {
    setAuth,
    tableId,
    token,
    orderSessionId,
    setOrderSessionId,
  } = useClientStore()
  const navigate = useNavigate()
  const { mutateAsync: createBooking } = useCreateBooking()
  const socket = useSocket() as any

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(() => {
    return localStorage.getItem('showConfirmModal') === 'true'
  })
  const [pendingOrder, setPendingOrder] = useState<any>(() => {
    const saved = localStorage.getItem('pendingOrder')
    return saved ? JSON.parse(saved) : null
  })

  const processedOrderIdRef = useRef<string | null>(null)
  const pendingBookingKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (pendingOrder) {
      localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder))
    } else {
      localStorage.removeItem('pendingOrder')
      localStorage.removeItem('showConfirmModal')
    }
    localStorage.setItem('showConfirmModal', String(showConfirmModal))
  }, [pendingOrder, showConfirmModal])

  const handleConfirmAction = (bookingData: any) => {
    const bookingId = bookingData.id
    if (processedOrderIdRef.current === bookingId) return
    processedOrderIdRef.current = bookingId

    setPendingOrder((prev: any) => {
      if (prev?.status === 'CONFIRMED') return prev
      return { ...prev, ...bookingData, status: 'CONFIRMED' }
    })

    onOrder()

    setTimeout(() => {
      setShowConfirmModal(false)
      navigate({ to: '/client/profile' as any })
    }, 2000)
  }

  const submitAuthorizedBooking = async (idempotencyKey: string) => {
    const formatItemNote = (item: any) => {
      const labels: string[] = []

      if (item.options?.liter) {
        labels.push(`${item.options.liter}L`)
      }

      if (item.options?.teaOptions) {
        labels.push(
          `${item.options.teaOptions.teaColor}${
            item.options.teaOptions.lemon ? ' + limon' : ''
          }`
        )
      }

      return labels.join(', ') || undefined
    }

    const result = await createBooking({
      tableId: tableId!,
      idempotencyKey,
      items: cartItems.map((item: any) => ({
        productId: item.serviceId,
        qty: item.qty,
        priceSnapshot: item.priceSnapshot,
        note: formatItemNote(item),
      })),
    })

    const bookingData = result.data
    const confirmedOrder = {
      id: bookingData.id,
      status: 'CONFIRMED',
    }
    setPendingOrder(confirmedOrder)
    setShowConfirmModal(true)
    handleConfirmAction(confirmedOrder)
  }

  const openTelegramLink = (telegramAppLink?: string, telegramLink?: string) => {
    const targetLink = telegramAppLink || telegramLink
    if (!targetLink) return
    window.open(targetLink, '_blank')
  }

  useEffect(() => {
    const handleAuthToken = async (data: any) => {
      if (!data || data.tableId !== tableId) return
      if (orderSessionId && data.orderSessionId !== orderSessionId) return

      setAuth({
        token: data.token,
        user: data.user,
      })
      localStorage.setItem('token', data.token)
      setOrderSessionId(null)

      try {
        const idempotencyKey =
          pendingBookingKeyRef.current ?? crypto.randomUUID()
        pendingBookingKeyRef.current = idempotencyKey
        await submitAuthorizedBooking(idempotencyKey)
      } catch (error) {
        console.error('Booking creation after Telegram auth failed:', error)
        alert(
          'Tasdiqlangandan keyin booking yaratib bo‘lmadi. Qayta urinib ko‘ring.'
        )
      }
    }

    if (!socket) return

    socket.on('auth:token', handleAuthToken)
    return () => {
      socket.off('auth:token', handleAuthToken)
    }
  }, [socket, tableId, orderSessionId, cartItems, createBooking, setAuth, setOrderSessionId])

  const handleSubmit = async () => {
    if (isSubmitting || !tableId) return
    setIsSubmitting(true)

    try {
      const idempotencyKey = pendingBookingKeyRef.current ?? crypto.randomUUID()
      pendingBookingKeyRef.current = idempotencyKey

      if (token) {
        await submitAuthorizedBooking(idempotencyKey)
        return
      }

      socket.emit('order:start', { tableId }, (response: any) => {
        if (!response?.success) {
          alert(
            response?.error?.message || 'Telegram sessiyasini boshlab bo‘lmadi.'
          )
          return
        }

        const sessionData = response.data
        setOrderSessionId(sessionData.orderSessionId)
        const newPendingOrder = {
          id: sessionData.orderSessionId,
          telegramAppUrl: sessionData.telegramAppLink,
          telegramUrl: sessionData.telegramLink,
          status: 'AWAITING_TELEGRAM',
        }
        setPendingOrder(newPendingOrder)
        setShowConfirmModal(true)

        openTelegramLink(sessionData.telegramAppLink, sessionData.telegramLink)
      })
    } catch (error) {
      console.error('Buyurtma yuborishda xatolik:', error)
      alert("Buyurtma yuborishda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className='mt-20 flex w-full flex-col items-center pb-20'>
        <Card className='mx-4 w-full max-w-2xl p-8 text-center'>
          <ShoppingCart className='mx-auto mb-4 h-16 w-16 text-muted-foreground/40' />
          <h2 className='mb-2 text-xl font-semibold text-muted-foreground'>
            Savat bo'sh
          </h2>
          <p className='mb-6 text-sm text-muted-foreground'>
            Hali hech qanday mahsulot tanlanmagan
          </p>
          <Button
            variant='outline'
            className='gap-2 rounded-full px-8'
            onClick={onBack}
          >
            <ArrowLeft className='h-4 w-4' />
            Menyuga qaytish
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='mt-20 flex w-full flex-col items-center pb-32'>
      <div className='w-full max-w-3xl px-4'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <ShoppingCart className='h-6 w-6 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>
              Sizning savatchangiz
            </h1>
          </div>
          <Badge variant='secondary' className='px-3 py-1 text-sm font-semibold'>
            {totalItems} ta mahsulot
          </Badge>
        </div>

        <div className='space-y-3'>
          {cartItems.map((item: any) => {
            const itemTotal = item.priceSnapshot * item.qty

            return (
              <Card
                key={item.id}
                className='overflow-hidden border-border/60 transition-all duration-200 hover:shadow-md'
              >
                <div className='flex gap-4 p-4'>
                  <div className='h-20 w-20 shrink-0 overflow-hidden rounded-xl'>
                    <img
                      src={item.service.photoUrl}
                      alt={item.service.name}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  <div className='flex min-w-0 flex-1 flex-col justify-between'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <h3 className='truncate text-base font-semibold'>
                          {item.service.name}
                        </h3>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {item.options.teaOptions && (
                            <Badge
                              variant='outline'
                              className='bg-primary/5 text-[10px] uppercase'
                            >
                              {item.options.teaOptions.teaColor}{' '}
                              {item.options.teaOptions.lemon && '+ Limon'}
                            </Badge>
                          )}
                          {item.options.liter && (
                            <Badge variant='outline' className='text-[10px]'>
                              {item.options.liter}L
                            </Badge>
                          )}
                        </div>
                        <p className='mt-1 truncate text-xs italic text-muted-foreground'>
                          {item.service.description}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='mt-2 flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        {item.priceSnapshot.toLocaleString()} so'm
                      </span>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-7 w-7 rounded-full'
                          onClick={() => updateQty(item.id, -1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus className='h-3.5 w-3.5' />
                        </Button>
                        <span className='w-6 text-center text-sm font-bold tabular-nums'>
                          {item.qty}
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-7 w-7 rounded-full'
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className='h-3.5 w-3.5' />
                        </Button>
                        <span className='ml-2 min-w-[70px] text-right text-sm font-semibold'>
                          {itemTotal.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className='mt-6 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>Umumiy summa</p>
              <p className='text-2xl font-extrabold tracking-tight'>
                {totalPrice.toLocaleString()}{' '}
                <span className='text-sm font-medium text-muted-foreground'>
                  so'm
                </span>
              </p>
            </div>
            <Package className='h-8 w-8 text-primary/50' />
          </div>
        </Card>
      </div>

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title='Buyurtmani tasdiqlash'
      >
        <div className='flex flex-col items-center gap-6 py-4 text-center'>
          {pendingOrder?.status === 'CONFIRMED' ? (
            <>
              <div className='rounded-full bg-emerald-100 p-4 dark:bg-emerald-500/10'>
                <CheckCircle2 className='h-12 w-12 text-emerald-500' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Booking qabul qilindi</h3>
                <p className='text-muted-foreground'>
                  Profil sahifasida buyurtma holatini ko'rishingiz mumkin.
                </p>
              </div>
              <Button
                className='w-full'
                onClick={() => {
                  setShowConfirmModal(false)
                  navigate({ to: '/client/profile' as any })
                }}
              >
                Profilni ko'rish
              </Button>
            </>
          ) : (
            <>
              <div className='rounded-full bg-blue-100 p-4 animate-pulse dark:bg-blue-500/10'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-500' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Telegram orqali tasdiqlang</h3>
                <p className='text-muted-foreground'>
                  Davom etish uchun Telegram botda telefon raqamingizni yuboring.
                </p>
              </div>
              <div className='flex w-full flex-col gap-2'>
                <Button
                  className='w-full gap-2'
                  onClick={() =>
                    openTelegramLink(
                      pendingOrder?.telegramAppUrl,
                      pendingOrder?.telegramUrl
                    )
                  }
                >
                  <ExternalLink className='h-4 w-4' />
                  Telegram botga o'tish
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => setShowConfirmModal(false)}
                >
                  Yopish
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <div className='animate-in slide-in-from-bottom-5 fixed bottom-10 flex gap-4'>
        <Button
          size='lg'
          variant='outline'
          className='gap-2 rounded-full px-8 shadow-2xl transition-transform hover:scale-105'
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className='h-5 w-5' />
          Ortga
        </Button>
        <Button
          size='lg'
          className='gap-2 rounded-full bg-emerald-600 px-8 shadow-2xl transition-transform hover:scale-105 hover:bg-emerald-700'
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <ShoppingCart className='h-5 w-5' />
          )}
          {isSubmitting
            ? 'Yuborilmoqda...'
            : `Buyurtma berish (${totalPrice.toLocaleString()} so'm)`}
        </Button>
      </div>
    </div>
  )
}
