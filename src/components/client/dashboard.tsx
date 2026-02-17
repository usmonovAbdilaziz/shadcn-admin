'use client'

import { useEffect, useState } from 'react'
import { useGetClientTable } from '@/hooks/client'
import { Button } from '../ui/button'
import { Modal } from '../ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { ClientFooter } from './Footer'
import { ClientHeader } from './Header'
import { ClientBody } from './client-body'

export const ClientDashboard = () => {
  const [tableId, setTableId] = useState<any>('')
  const { data: tables } = useGetClientTable('')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const table = localStorage.getItem('tableId')
    if (!table) {
      setOpen(true)
    }
  }, [tables])
  const findTable = () => {
    localStorage.setItem('tableId', tableId)
    setOpen(false)
  }
  const tableData = tables?.data.filter(
    (table: any) => table.status === 'EMPTY'
  )
  return (
    <div className='flex flex-col gap-4'>
      <ClientHeader />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title='Stolingizni tanlang'
      >
        <Select onValueChange={(value) => setTableId(value)}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Stolingizni tanlang' />
          </SelectTrigger>
          <SelectContent>
            {tableData?.map((table: any) => (
              <SelectItem key={table.id} value={table.id}>
                <span className='text-[20px] text-black'>
                  {table.tableNumber}
                  {table.tableColumns}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className='mt-4 w-full' onClick={findTable}>
          Tasdiqlash
        </Button>
      </Modal>
      <ClientBody />
      <ClientFooter />
    </div>
  )
}
