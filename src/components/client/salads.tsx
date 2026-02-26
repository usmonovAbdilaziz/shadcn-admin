import { useState } from 'react'
import {
  Timer,
  User,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  ThermometerSun,
  Snowflake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useCartStore } from '@/store/use-cart-store'

export const Salads = ({ services }: any) => {
  const { items: cartItems, updateQty, addToCart } = useCartStore()
  const [type, setType] = useState('HOT')
  const servicesHotData = services?.data.filter(
    (service: any) =>
      service.category === 'SALADS' &&
      service.isActive === true &&
      service.type === type
  )
  
  return (
    <Card className='w-full overflow-hidden p-4'>
      <div className='mb-4 flex w-full items-center justify-between'>
      <h1 className='text-2xl font-bold'>Sweets</h1>
      <div className="inline-flex rounded-xl border bg-background/60 p-1 shadow-sm backdrop-blur">
          <Button
            size="sm"
            variant={type === "HOT" ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              type === "HOT" ? "shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setType("HOT")}
          >
            <ThermometerSun className="mr-2 h-4 w-4" />
            Hot
          </Button>
          <Button
            size="sm"
            variant={type === "COLD" ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              type === "COLD" ? "shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setType("COLD")}
          >
            <Snowflake  className="mr-2 h-4 w-4" />
            Cold
          </Button>
        </div>
          </div>
      <div className='flex flex-wrap gap-4'>
        {servicesHotData?.map((service: any) => {
          const item = cartItems.find(i => i.serviceId === service.id && Object.keys(i.options).length === 0)
          const count = item?.qty || 0
          const isSelected = count > 0

          return (
            <Card
              key={service.id}
              className={cn(
                'group relative w-[280px] overflow-hidden border-2 transition-all duration-300',
                isSelected
                  ? 'border-primary scale-[1.02] shadow-lg'
                  : 'border-transparent shadow-sm'
              )}
            >
              <div className='flex flex-col'>
                {/* Rasm qismi */}
                <div className='relative h-[200px] w-full overflow-hidden'>
                  <img
                    src={service.photoUrl}
                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                    alt={service.name}
                  />
                  <div className='absolute bottom-2 left-2 flex gap-1 '>
                    <Badge
                      variant='secondary'
                      className='bg-white/80 backdrop-blur-sm dark:bg-black'
                    >
                      <Timer className='mr-1 h-3 w-3 ' /> {service.duration} min
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className='animate-in zoom-in absolute top-2 right-2'>
                      <CheckCircle2 className='text-green h-6 w-6 fill-white dark:fill-black' />
                    </div>
                  )}
                </div>

                {/* Ma'lumotlar qismi */}
                <div className='space-y-3 p-4'>
                  <div>
                    <h3 className='group-hover:text-primary text-lg leading-tight font-bold capitalize transition-colors'>
                      {service.name}
                    </h3>
                    <p className='text-muted-foreground mt-1 line-clamp-1 text-sm italic'>
                      {service.description}
                    </p>
                  </div>

                  <div className='flex items-center gap-2 text-sm font-medium text-gray-600'>
                    <User className='text-primary h-4 w-4' />
                    <span>Oshpaz: {service.staff[0]?.fullName}</span>
                  </div>

                  <div className='flex items-center justify-between border-t pt-3'>
                    <div className='flex flex-col'>
                      <span className='text-primary text-lg font-extrabold'>
                        {service.price.toLocaleString()}{' '}
                        <small className='text-[10px]'>so'm</small>
                      </span>
                      {count > 1 && (
                        <span className='text-[11px] text-gray-400'>
                          Jami: {(service.price * count).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className='flex items-center gap-2'>
                      {isSelected && (
                        <>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 rounded-full'
                            onClick={() => { if (item) updateQty(item.id, -1) }}
                          >
                            <MinusCircle className='h-4 w-4' />
                          </Button>
                          <span className='w-4 text-center font-bold'>
                            {count}
                          </span>
                        </>
                      )}
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size='icon'
                        className='h-8 w-8 rounded-full'
                        onClick={() => addToCart(service, {})}
                      >
                        <PlusCircle className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
