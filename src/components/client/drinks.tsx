import {
  Timer,
  User,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useState } from 'react'

export const Drinks = ({ services, cart, updateCount }: any) => {
  const [type, setType] = useState('HOT')
  const servicesDrinksData = services?.data.filter(
    (service: any) => service.isActive === true && service.type === 'DRINK'
  )
  console.log(services)

  console.log(servicesDrinksData)

  return (
    <div>
      <div className='flex w-full items-center justify-end gap-2'>
        <Button
          size={'sm'}
          variant={type === 'HOT' ? 'default' : 'outline'}
          onClick={() => setType('HOT')}
        >
          Hot
        </Button>
        <Button
          size={'sm'}
          variant={type === 'COLD' ? 'default' : 'outline'}
          onClick={() => setType('COLD')}
        >
          Cold
        </Button>
      </div>
      <h1 className='text-2xl font-bold'>Drinks</h1>
      {servicesDrinksData?.map((service: any) => {
        const count = cart[service.id] || 0
        const isSelected = count > 0

        return (
          <Card
            key={service.id}
            className={cn(
              'group relative w-[300px] overflow-hidden border-2 transition-all duration-300',
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
                <div className='absolute bottom-2 left-2 flex gap-1'>
                  <Badge
                    variant='secondary'
                    className='bg-white/80 backdrop-blur-sm'
                  >
                    <Timer className='mr-1 h-3 w-3' /> {service.duration} min
                  </Badge>
                </div>
                {isSelected && (
                  <div className='animate-in zoom-in absolute top-2 right-2'>
                    <CheckCircle2 className='text-primary h-6 w-6 fill-white' />
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
                          onClick={() => updateCount(service.id, -1)}
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
                      onClick={() => updateCount(service.id, 1)}
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
  )
}
