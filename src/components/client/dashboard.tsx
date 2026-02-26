'use client'

import { useEffect, useRef, useState } from 'react'
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
import { socket } from '@/lib/socket-client'
import { Outlet, useMatchRoute } from '@tanstack/react-router'

function ClientSocketProvider({ children }: { children: React.ReactNode }) {
  const didConnect = useRef(false)
  const [status, setStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    // localStorage dagi tableId ni tekshirish
    const updateRoom = () => {
      const id = localStorage.getItem('tableId')
      setRoomId(id)
    }

    updateRoom()
    // Oyna focus bo'lganda yoki storage o'zgarganda (boshqa tabda) yangilash
    window.addEventListener('storage', updateRoom)
    window.addEventListener('focus', updateRoom)

    return () => {
      window.removeEventListener('storage', updateRoom)
      window.removeEventListener('focus', updateRoom)
    }
  }, [])

  useEffect(() => {
    if (didConnect.current) {
      // Agar allaqachon ulangan bo'lsa va roomId o'zgarsa, qayta qo'shilish
      if (socket.connected && roomId) {
        console.log('🔄 Re-joining room:', roomId)
        socket.emit('joinRoom', roomId)
      }
      return
    }
    didConnect.current = true

    if (!socket.connected) socket.connect()

    const onConnect = () => {
      console.log('✅ socket connected', socket.id)
      setStatus('connected')
      // Ulangan zahoti xonaga qo'shilish
      const curId = localStorage.getItem('tableId')
      if (curId) {
        console.log('📡 Emitting joinRoom on connect:', curId)
        socket.emit('joinRoom', curId)
      }
    }

    const onDisconnect = (reason: string) => {
      console.log('⚠️ socket disconnected', reason)
      setStatus('disconnected')
    }

    const onJoinedRoom = (data: any) => {
      console.log('✅ joined room confirmation from server:', data)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('joinedRoom', onJoinedRoom)

    if (socket.connected) {
      setStatus('connected')
      const curId = localStorage.getItem('tableId')
      if (curId) socket.emit('joinRoom', curId)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('joinedRoom', onJoinedRoom)
    }
  }, [roomId])

  return (
    <>
      {/* Socket status indicator */}
      <div className='fixed top-2 right-2 z-50'>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-lg transition-all ${
            status === 'connected'
              ? 'bg-emerald-500/20 text-emerald-400'
              : status === 'connecting'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              status === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
            }`}
          />
          {status === 'connected'
            ? 'Online'
            : status === 'connecting'
              ? 'Ulanmoqda...'
              : 'Offline'}
        </div>
      </div>
      {children}
    </>
  )
}

export const ClientDashboard = () => {
  const [tableId, setTableId] = useState<any>('')
  const { data: tables } = useGetClientTable('')
  const [open, setOpen] = useState(false)
  const matchRoute = useMatchRoute()
  const isProfileRoute = matchRoute({ to: '/client/profile' })

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
      <ClientSocketProvider>
        <ClientHeader />
        
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title='Stolingizni tanlang'
        >
          <Select onValueChange={(value) => setTableId(value)}>
            <SelectTrigger className='w-full dark:text-white text-black'>
              <SelectValue placeholder='Stolingizni tanlang' />
            </SelectTrigger>
            <SelectContent>
              {tableData?.map((table: any) => (
                <SelectItem key={table.id} value={table.id}>
                  <span className='text-[20px] text-black dark:text-white'>
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

        {isProfileRoute ? <Outlet /> : <ClientBody />}
        <ClientFooter />
      </ClientSocketProvider>
    </div>
  )
}
