import { useEffect, useState } from 'react'
import { useClientStore } from '@/store/use-client-store'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ArrowLeft, Package, Clock, Phone, User } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

import { useNavigate } from '@tanstack/react-router'

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
          headers: { Authorization: `Bearer ${token}` }
        })
        const clientId = meResponse.data?.data?.id
        if (!clientId) {
          throw new Error('Client ID not found')
        }
        const response = await axios.get(`http://localhost:3002/api/v1/booking/client/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log("response",orders);
        
        setOrders(response.data.data)
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
          <User className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
          <h2 className='text-xl font-bold'>Profil topilmadi</h2>
          <p className='text-muted-foreground mt-2'>Buyurtma berish orqali profil yaratishingiz mumkin</p>
          <Button className='mt-6 w-full' onClick={() => navigate({ to: '/client' as any })}>Menyuga qaytish</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='mt-20 flex flex-col items-center px-4 pb-20'>
      <div className='w-full max-w-2xl'>
        <div className='mb-6 flex items-center justify-between'>
          <Button variant='ghost' size='sm' onClick={() => navigate({ to: '/client' as any })} className='gap-2'>
            <ArrowLeft className='h-4 w-4' /> Ortga
          </Button>
          <Button variant='outline' size='sm' onClick={() => { logout(); navigate({ to: '/client' as any }) }} className='text-destructive'> Chiqish</Button>
        </div>

        <Card className='mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary'>
              <User className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>Mijoz Profili</h1>
              <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                <Phone className='h-3 w-3' /> {phone}
              </div>
            </div>
          </div>
        </Card>

        <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
          <Package className='h-5 w-5' /> Buyurtmalar tarixi
        </h2>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => <div key={i} className='h-32 w-full animate-pulse bg-muted rounded-xl' />)}
          </div>
        ) : orders.length === 0 ? (
          <Card className='p-8 text-center text-muted-foreground'>
            Hali buyurtmalar mavjud emas
          </Card>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <Card key={order.id} className='p-4 hover:shadow-md transition-shadow'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <span className='text-xs text-muted-foreground'>ID: {order.id.substring(0, 8)}</span>
                    <p className='text-sm font-semibold mt-1'>
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'} className={order.status === 'CONFIRMED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {order.status === 'CONFIRMED' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                  </Badge>
                </div>
                
                <div className='space-y-1 mb-3'>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className='text-sm flex justify-between'>
                      <span className='text-muted-foreground'>{item.nameSnapshot} x{item.qty}</span>
                      <span>{(item.priceSnapshot * item.qty)} so'm</span>
                    </div>
                  ))}
                </div>

                <div className='pt-3 border-t flex justify-between items-center'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Clock className='h-3 w-3' /> {order.etaMinutes} daqiqa
                  </div>
                  <div className='font-bold text-lg'>
                    {order.totalPrice} so'm
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
