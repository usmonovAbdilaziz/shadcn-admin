import { useGetClientTable } from '@/hooks/client'

export const ClientHeader = () => {
  const tableId = localStorage.getItem('tableId')
  const { data: tables } = useGetClientTable(tableId!)
  console.log(tables)
  return (
    <header className='fixed top-0 right-0 left-0 z-50'>
      <div className='flex justify-between bg-white p-4 shadow-sm'>
        <ul className='flex items-center gap-2'>
          <li>
            <h1 className='text-[20px] text-black'>Stol raqamingiz:</h1>
          </li>
          <li className='text-[20px] text-black'>
            {tables?.data.tableNumber}
            {tables?.data.tableColumns}
          </li>
        </ul>
      </div>
    </header>
  )
}
