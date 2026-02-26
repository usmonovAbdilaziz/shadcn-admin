import { useState, useEffect, useRef } from 'react'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Package,
  Loader2,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCreateOrder, useGetOrderStatus } from '@/hooks/order'
import { useSocket } from '@/context/socket-context'
import { Modal } from '../ui/modal'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { useClientStore } from '@/store/use-client-store'
import { useNavigate } from '@tanstack/react-router'

interface KarzinkaProps {
  services: any
  onBack: () => void
  onOrder: () => void
}

export const Karzinka = ({
  onBack,
  onOrder,
}: KarzinkaProps) => {
  const { items: cartItems, updateQty, removeFromCart, totalPrice, totalItems } = useCartStore()
  const { setClient } = useClientStore()
  const navigate = useNavigate()
  
  const tableId = localStorage.getItem('tableId')
  const { mutateAsync: createOrder } = useCreateOrder()
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

  // Start polling if we have a pending order that isn't confirmed yet
  const { data: orderStatusData } = useGetOrderStatus(
    pendingOrder?.id, 
    !!pendingOrder && pendingOrder.status !== 'CONFIRMED' && showConfirmModal
  )

  useEffect(() => {
    if (pendingOrder) {
      localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder))
    } else {
      localStorage.removeItem('pendingOrder')
      localStorage.removeItem('showConfirmModal')
    }
    localStorage.setItem('showConfirmModal', String(showConfirmModal))
  }, [pendingOrder, showConfirmModal])

  // Unified confirmation handler to prevent duplicate side effects
  const handleConfirmAction = (orderData: any) => {
    const orderId = orderData.id || orderData.orderId
    
    // Lock: only run side effects once per order ID
    if (processedOrderIdRef.current === orderId) return
    processedOrderIdRef.current = orderId

    console.log('✅ Handling order confirmation:', orderId)
    
    // 1. Update local state
    setPendingOrder((prev: any) => {
      if (prev?.status === 'CONFIRMED') return prev
      return { ...prev, ...orderData, status: 'CONFIRMED' }
    })
    
    // 2. Save client session
    if (orderData.token) {
      console.log('🔑 Token received, saving to client store')
      setClient({ 
        token: orderData.token, 
        phone: orderData.phone,
        fullName: 'Mijoz'
      })
      // Legacy support/External scripts
      localStorage.setItem('token', orderData.token)
    }
    
    // 3. Side effects
    onOrder() // Clear cart
      
    // 4. Navigation
    setTimeout(() => {
      setShowConfirmModal(false)
      navigate({ to: '/client/profile' as any })
    }, 2000)
  }

  // Effect for Polling
  useEffect(() => {
    const orderData = orderStatusData?.data
    if (orderData && orderData.status === 'CONFIRMED') {
      console.log('🔄 Polling sync: Order confirmed')
      handleConfirmAction(orderData)
    }
  }, [orderStatusData?.data?.status]) // Only react to status changes in polling data

  // Effect for Socket
  useEffect(() => {
    const handleSocketConfirm = (data: any) => {
      console.log('📡 Socket sync: Order confirmed', data)
      handleConfirmAction(data)
    }

    if (socket) {
      socket.on('order:confirmed', handleSocketConfirm)
      return () => {
        socket.off('order:confirmed', handleSocketConfirm)
      }
    }
  }, [socket]) // Socket is stable, bound once

  const handleSubmit = async () => {
    if (isSubmitting || !tableId) return
    setIsSubmitting(true)
    console.log('🚀 Submitting order for table:', tableId);

    try {
      const result = await createOrder({ tableId, items: cartItems })
      console.log('📦 Order creation result:', result);
      
      const orderData = result.data
      const newPendingOrder = {
        id: orderData.orderId,
        telegramUrl: orderData.telegramUrl,
        status: 'PENDING_CONFIRM'
      }
      
      setPendingOrder(newPendingOrder)
      setShowConfirmModal(true)
      
      if (orderData.telegramUrl) {
        window.open(orderData.telegramUrl, '_blank')
      }
    } catch (error) {
      console.error('Buyurtma yuborishda xatolik:', error)
      alert('Buyurtma yuborishda xatolik yuz berdi. Qayta urinib ko\'ring.')
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
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <ShoppingCart className='h-6 w-6 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>Sizning savatchangiz</h1>
          </div>
          <Badge
            variant='secondary'
            className='px-3 py-1 text-sm font-semibold'
          >
            {totalItems} ta mahsulot
          </Badge>
        </div>

        {/* Cart Items */}
        <div className='space-y-3'>
          {cartItems.map((item) => {
            const itemTotal = item.priceSnapshot * item.qty

            return (
              <Card
                key={item.id}
                className='overflow-hidden border-border/60 transition-all duration-200 hover:shadow-md'
              >
                <div className='flex gap-4 p-4'>
                  {/* Image */}
                  <div className='h-20 w-20 shrink-0 overflow-hidden rounded-xl'>
                    <img
                      src={item.service.photoUrl}
                      alt={item.service.name}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  {/* Info + Controls */}
                  <div className='flex min-w-0 flex-1 flex-col justify-between'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <h3 className='truncate text-base font-semibold'>
                          {item.service.name}
                        </h3>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {item.options.teaOptions && (
                            <Badge variant='outline' className='text-[10px] bg-primary/5 uppercase'>
                              {item.options.teaOptions.teaColor} {item.options.teaOptions.lemon && '+ Limon'}
                            </Badge>
                          )}
                          {item.options.liter && (
                            <Badge variant='outline' className='text-[10px]'>
                              {item.options.liter}L
                            </Badge>
                          )}
                        </div>
                        <p className='truncate text-xs text-muted-foreground italic mt-1'>
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

        {/* Summary */}
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

      {/* Confirmation Modal */}
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
                <h3 className='text-xl font-bold'>Buyurtmangiz qabul qilindi!</h3>
                <p className='text-muted-foreground'>
                  Taomlar tayyorlanmoqda. Taxminiy vaqt:{' '}
                  <span className='font-bold text-foreground'>
                    {pendingOrder.etaMinutes} daqiqa
                  </span>
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
                <Loader2 className='h-12 w-12 text-blue-500 animate-spin' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Telegram orqali tasdiqlang</h3>
                <p className='text-muted-foreground'>
                  Buyurtmangizni yakunlash uchun Telegram botimizda telefon raqamingizni yuboring.
                </p>
              </div>
              <div className='flex w-full flex-col gap-2'>
                <Button 
                  className='w-full gap-2' 
                  onClick={() => window.open(pendingOrder?.telegramUrl, '_blank')}
                >
                  <ExternalLink className='h-4 w-4' />
                  Telegram Botga o'tish
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

      {/* Bottom fixed buttons */}
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
