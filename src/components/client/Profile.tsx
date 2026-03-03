import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from '@tanstack/react-router'
import { useClientStore } from '@/store/use-client-store'
import {
  ArrowLeft,
  Package,
  Clock,
  Phone,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export const ClientProfile = () => {
  const { token, phone, logout } = useClientStore()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return
      try {
        const meResponse = await axios.get('http://localhost:3002/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const clientId = meResponse.data?.data?.id
        if (!clientId) {
          throw new Error('Client ID not found')
        }
        const response = await axios.get(
          `http://localhost:3002/api/v1/booking/client/${clientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        setOrders(response.data.data?.items || [])
        toast.success('Buyurtmalar yuklandi')
      } catch (error) {
        toast.error('Buyurtmalarni yuklashda xatolik')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [token])

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
            onClick={() => navigate({ to: '/client' as any })}
          >
            Menyuga qaytish
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='mt-20 flex flex-col items-center px-4 pb-20'>
      <div className='w-full max-w-2xl'>
        <div className='mb-6 flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/client' as any })}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' /> Ortga
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              logout()
              navigate({ to: '/client' as any })
            }}
            className='text-destructive'
          >
            {' '}
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
                <Phone className='h-3 w-3' /> {phone}
              </div>
            </div>
          </div>
        </Card>

        <h2 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <Package className='h-5 w-5' /> Buyurtmalar tarixi
        </h2>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='bg-muted h-32 w-full animate-pulse rounded-xl'
              />
            ))}
          </div>
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
                      (sum: number, item: any) =>
                        sum + item.priceSnapshot * item.qty,
                      0
                    )
                ) || 0

              const statusLabel =
                order.status === 'CONFIRMED'
                  ? 'Tasdiqlangan'
                  : order.status === 'PENDING'
                    ? 'Kutilmoqda'
                    : order.status

              const badgeVariant =
                order.status === 'CONFIRMED' ? 'default' : 'secondary'

              return (
                <AccordionItem
                  key={order.id}
                  value={order.id}
                  className='border-0'
                >
                  <Card className='p-0 transition-shadow hover:shadow-md'>
                    {/* HEADER (always visible) */}
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
                            <Clock className='h-3 w-3' /> Stol #{' '}
                            {order.table?.tableNumber}
                          </div>
                        </div>

                        <div className='flex shrink-0 flex-col items-end gap-2'>
                          <Badge
                            variant={badgeVariant}
                            className={
                              order.status === 'CONFIRMED'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : ''
                            }
                          >
                            {statusLabel}
                          </Badge>

                          <div className='text-lg font-bold'>{total} so'm</div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    {/* DROPDOWN CONTENT */}
                    <AccordionContent className='px-4 pb-4'>
                      <div className='mt-2 space-y-1 border-t pt-3'>
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className='flex justify-between text-sm'
                          >
                            <span className='text-muted-foreground'>
                              {item.product?.name || item.productId}
                              {item.note ? ` (${item.note})` : ''} x{item.qty}
                            </span>
                            <span>{item.priceSnapshot * item.qty} so'm</span>
                          </div>
                        ))}
                      </div>

                      {/* xohlasangiz pastda actionlar ham qo‘shasiz */}
                      {/* <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="secondary">Bekor qilish</Button>
                  <Button size="sm">Tasdiqlash</Button>
                </div> */}
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
