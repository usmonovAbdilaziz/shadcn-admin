import { useGetClientMe, useGetClientTable } from '@/hooks/client'
import { useClientStore } from '@/store/use-client-store'
import { User } from 'lucide-react'
import { Button } from '../ui/button'
import { useNavigate } from '@tanstack/react-router'

export const ClientHeader = () => {
  const { token } = useClientStore()
  const { tableId } = useClientStore()
  const {data:clientMe} =useGetClientMe(token!)
  const { data: tables } = useGetClientTable({ tableId })
  const navigate = useNavigate()

  return (
    <header className='fixed top-0 right-0 left-0 z-50'>
      <div className='flex justify-between items-center bg-white dark:bg-gray-800 p-4 shadow-sm'>
        <ul className='flex items-center gap-2'>
          <li>
            <h1 className='text-[16px] md:text-[20px] text-black dark:text-white font-medium'>Stol:</h1>
          </li>
          <li className='text-[16px] md:text-[20px] text-black dark:text-white font-bold'>
            {tables?.data.tableNumber}
            {tables?.data.tableColumns}
          </li>
        </ul>

        <div className='flex items-center gap-3'>
          {token ? (
            <Button 
              variant='ghost' 
              size='sm' 
              className='flex items-center gap-2 text-primary hover:bg-primary/10 rounded-full'
              onClick={() => navigate({ to: '/client/profile' as any })}
            >
              <div className='hidden md:block text-xs font-semibold'>{clientMe?.data?.fullName}</div>
              <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center'>
                <User className='h-4 w-4' />
              </div>
            </Button>
          ) : (
            <div className='text-[10px] text-muted-foreground italic px-2'>
              Tizimga kirilmagan
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
