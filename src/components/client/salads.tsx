import { useState } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export const Salads = ({ services, cart, updateCount }: any) => {
  const [type, setType] = useState('HOT')
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
      {services?.data
        .filter(
          (service: any) =>
            service.category === 'SALADS' && service.isActive === true
        )
        .map((service: any) => (
          <Card key={service.id}>
            <h1>{service.name}</h1>
          </Card>
        ))}
      <h1>salads</h1>
    </div>
  )
}
