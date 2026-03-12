import { type ComponentType, useCallback, useEffect, useState } from 'react'
import { useCartStore } from '@/store/use-cart-store'
import { useClientStore } from '@/store/use-client-store'
import { ShoppingBag } from 'lucide-react'
import { useGetClientMe, useGetClientServices } from '@/hooks/client'
import { Button } from '../ui/button'
import { Karzinka } from './Karzinka'
import { Drinks } from './drinks'
import { HotMeals } from './hot-meals'
import { Salads } from './salads'
import { Sweets } from './sweeds'

type Category = 'FOODS' | 'DRINKS' | 'SWEETS' | 'SALADS'

const CATEGORY_COMPONENTS: Record<
  Category,
  ComponentType<{ services: unknown }>
> = {
  FOODS: HotMeals,
  DRINKS: Drinks,
  SWEETS: Sweets,
  SALADS: Salads,
}

const CATEGORIES: Category[] = ['FOODS', 'DRINKS', 'SWEETS', 'SALADS']

const CATEGORY_STORAGE_KEY = 'client_active_category'
const KARZINKA_STORAGE_KEY = 'client_show_karzinka'

const loadCategoryIndex = (): number => {
  try {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (saved) {
      const idx = parseInt(saved, 10)
      if (idx >= 0 && idx < CATEGORIES.length) return idx
    }
  } catch {
    return 0
  }
  return 0
}

export const ClientBody = () => {
  const { token, businessId, setClientId } = useClientStore()
  const { data: services } = useGetClientServices(businessId || '')
  const [count, setCount] = useState(loadCategoryIndex)
  const { items: cartItems, clearCart, totalItems, syncTotals } = useCartStore()
  const { data: client } = useGetClientMe(token!)

  useEffect(() => {
    const clientId = client?.data?.id || client?.id
    if (clientId) {
      setClientId(clientId)
    }
  }, [client, setClientId])

  useEffect(() => {
    syncTotals()
  }, [syncTotals])
  const [showKarzinka, setShowKarzinka] = useState(() => {
    try {
      return localStorage.getItem(KARZINKA_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem(KARZINKA_STORAGE_KEY, showKarzinka.toString())
  }, [showKarzinka])

  // State management functions moved to store or refactored to use store items

  const activeCategory = CATEGORIES[count]
  const ActiveComponent = CATEGORY_COMPONENTS[activeCategory]

  const handleNext = () => {
    if (cartItems.length === 0) {
      alert('Iltimos, kamida bitta xizmatni tanlang!')
      return
    }

    if (count < CATEGORIES.length - 1) {
      setCount((prev) => prev + 1)
    } else {
      setShowKarzinka(true)
    }
  }

  const handleOrder = useCallback(() => {
    // Cart tozalash
    clearCart()
    setShowKarzinka(false)
    setCount(0)
    localStorage.removeItem(CATEGORY_STORAGE_KEY) // We can reset category too if wanted
  }, [clearCart])

  const handleBackFromKarzinka = useCallback(() => {
    setShowKarzinka(false)
    setCount(CATEGORIES.length - 1)
  }, [])

  const handlePrev = () => {
    if (count > 0) {
      setCount((prev) => prev - 1)
    }
  }

  if (showKarzinka) {
    return <Karzinka onBack={handleBackFromKarzinka} onOrder={handleOrder} />
  }

  return (
    <div className='mt-20 flex w-full flex-col items-center pb-20'>
      <div className='flex w-full max-w-[1280px] flex-wrap justify-center gap-6 px-4'>
        {ActiveComponent && <ActiveComponent services={services} />}
      </div>

      {cartItems.length > 0 && (
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
            {totalItems}
          </Button>
        </div>
      )}
    </div>
  )
}
