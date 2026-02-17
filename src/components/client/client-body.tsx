import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useGetClientServices } from '@/hooks/client'
import { Button } from '../ui/button'
import { Drinks } from './drinks'
import { HotMeals } from './hot-meals'
import { Salads } from './salads'
import { Sweets } from './sweeds'

type Category = 'FOODS' | 'DRINKS' | 'SWEETS' | 'SALADS'

const CATEGORY_COMPONENTS: Record<Category, React.ComponentType<any>> = {
  FOODS: HotMeals,
  DRINKS: Drinks,
  SWEETS: Sweets,
  SALADS: Salads,
}

const CATEGORIES: Category[] = ['FOODS', 'DRINKS', 'SWEETS', 'SALADS']

export const ClientBody = () => {
  const { data: services } = useGetClientServices()
  const [count, setCount] = useState(0)
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  const activeCategory = CATEGORIES[count]
  const ActiveComponent = CATEGORY_COMPONENTS[activeCategory]

  const updateCount = (id: string, delta: number) => {
    setCart((prev) => {
      const currentCount = prev[id] || 0
      const newCount = Math.max(0, currentCount + delta)

      if (newCount === 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: newCount }
    })
  }

  const handleNext = () => {
    const payload = Object.entries(cart).map(([serviceId, count]) => ({
      serviceId,
      count,
    }))

    if (payload.length === 0) {
      alert('Iltimos, kamida bitta xizmatni tanlang!')
      return
    }

    localStorage.setItem('selectedServices', JSON.stringify(payload))

    if (count < CATEGORIES.length - 1) {
      setCount((prev) => prev + 1)
    } else {
      console.log('Final Order:', payload)
      // Optional: Navigate to checkout or summary page
    }
  }

  const handlePrev = () => {
    if (count > 0) {
      setCount((prev) => prev - 1)
    }
  }

  return (
    <div className='mt-20 flex w-full flex-col items-center pb-20'>
      <div className='flex w-full max-w-[1280px] flex-wrap justify-center gap-6 px-4'>
        {ActiveComponent && (
          <ActiveComponent
            services={services}
            cart={cart}
            updateCount={updateCount}
          />
        )}
      </div>

      {Object.keys(cart).length > 0 && (
        <div className='animate-in slide-in-from-bottom-5 fixed bottom-10 flex gap-4'>
          {count > 0 && (
            <Button
              size='lg'
              variant='outline'
              className='gap-2 rounded-full px-8 shadow-2xl transition-transform hover:scale-105'
              onClick={handlePrev}
            >
              Back
            </Button>
          )}
          <Button
            size='lg'
            className='gap-2 rounded-full px-8 shadow-2xl transition-transform hover:scale-105'
            onClick={handleNext}
          >
            <ShoppingBag className='h-5 w-5' />
            {count === CATEGORIES.length - 1
              ? 'Finish Order'
              : 'Next Category'}{' '}
            ({Object.values(cart).reduce((a, b) => a + b, 0)})
          </Button>
        </div>
      )}
    </div>
  )
}
