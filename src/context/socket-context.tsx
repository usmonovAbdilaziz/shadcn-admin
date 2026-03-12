import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import { useClientStore } from '@/store/use-client-store'
import { socket } from '@/lib/socket-client'

interface SocketContextType {
  socket: typeof socket
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context.socket
}

export const SocketProvider: React.FC<{
  children: ReactNode
  tableId?: string
}> = ({ children, tableId }) => {
  const storedTableId = useClientStore((state) => state.tableId)
  const clientId = useClientStore((state) => state.clientId)
  const activeTableId = tableId ?? storedTableId

  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const joinActiveTableRoom = () => {
      if (!activeTableId) return
      socket.emit('joinRoom', { tableId: activeTableId })
    }

    socket.on('connect', joinActiveTableRoom)

    if (socket.connected) {
      joinActiveTableRoom()
    }

    return () => {
      socket.off('connect', joinActiveTableRoom)
    }
  }, [activeTableId])

  useEffect(() => {
    const joinClientRoom = () => {
      if (!clientId) return
      socket.emit('joinClientRoom', { clientId })
    }

    socket.on('connect', joinClientRoom)

    if (socket.connected) {
      joinClientRoom()
    }

    return () => {
      socket.off('connect', joinClientRoom)
    }
  }, [clientId])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
