'use client'

import { useEffect, useRef, useState } from 'react'
import { useGetClientBusiness, useGetClientTable } from '@/hooks/client'
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
import { Outlet, useMatchRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { useClientStore } from '@/store/use-client-store'

function ClientSocketProvider({ children }: { children: React.ReactNode }) {
  const didConnect = useRef(false)
  const tableId = useClientStore((s) => s.tableId)
  const [status, setStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')

  useEffect(() => {
    if (didConnect.current) {
      if (socket.connected && tableId) {
        console.log('🔄 Re-joining room:', tableId)
        socket.emit('joinRoom', tableId)
      }
      return
    }
    didConnect.current = true

    if (!socket.connected) socket.connect()

    const onConnect = () => {
      setStatus('connected')
      const curId = useClientStore.getState().tableId
      if (curId) {
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
      const curId = useClientStore.getState().tableId
      if (curId) socket.emit('joinRoom', curId)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('joinedRoom', onJoinedRoom)
    }
  }, [tableId])

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
  const [selectedTableId, setSelectedTableId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [selectBusinessId, setSelectBusinessId] = useState<string>('')
  const businesses = useGetClientBusiness()
  const tableId = useClientStore((s) => s.tableId)
  const setTableId = useClientStore((s) => s.setTableId)
  const setBusinessId = useClientStore((s) => s.setBusinessId)
  const { data: tables } = useGetClientTable({ businessId: selectBusinessId })
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()
  const routerState = useRouterState()

  const isProfileRoute = matchRoute({ to: '/client/profile' })

  // Check tableId on every route change — if missing, redirect to /client and open modal
  useEffect(() => {
    if (!tableId) {
      navigate({ to: '/client' }).then(() => {
        setOpen(true)
      })
    }
  }, [routerState.location.pathname, tableId])
  // Also open on mount if tableId is missing and tables are loaded
  useEffect(() => {
    if (!tableId && tables) {
      setOpen(true)
    }
  }, [tables])
  useEffect(() => {
    if (selectBusinessId) {
      setBusinessId(selectBusinessId)
    }
  }, [selectBusinessId, setBusinessId])
  const findTable = () => {
    if (!selectedTableId) return
    setTableId(selectedTableId)
    setOpen(false)
  }

  const tableList = Array.isArray(tables?.data) ? tables.data : []
  const tableData = tableList.filter(
    (table: any) => table.status === 'EMPTY'
  )

  return (
    <div className='flex flex-col gap-4'>
      <ClientSocketProvider>
        <ClientHeader />

        {/* Table selection modal — cannot be dismissed without selecting a table */}
        <Modal
          open={open}
          onClose={() => {
            // Prevent dismissal without a table selected
            if (!tableId) return
            setOpen(false)
          }}
          title='Stolingizni tanlang'
        > <div className='flex flex-col gap-4'>

          
          {businesses.isSuccess && (
            <Select onValueChange={(value) => setSelectBusinessId(value)}>
              <h1 className='text-lg font-semibold'>Businessni tanlang</h1>
              <SelectTrigger className='w-full dark:text-white text-black'>
                <SelectValue placeholder='Biznesni tanlang' />
              </SelectTrigger>
              <SelectContent>
                {businesses.data.data.map((business: any) => (
                  <SelectItem key={business.id} value={business.id}>
                    <span className='text-[20px] text-black dark:text-white'>
                      {business.businessName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectBusinessId && <Select onValueChange={(value) => setSelectedTableId(value)}>
            <p className='mt-3 text-sm text-muted-foreground'>
                 Davom etish uchun stolingizni tanlashingiz shart.
              </p>
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
          </Select>}
          <Button
            className='mt-4 w-full'
            onClick={findTable}
            disabled={!selectedTableId}
            >
            Tasdiqlash
          </Button>
            </div>
        </Modal>

        {isProfileRoute ? <Outlet /> : <ClientBody />}
        <ClientFooter />
      </ClientSocketProvider>
    </div>
  )
}
