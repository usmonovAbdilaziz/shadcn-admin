import { useEffect } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useSocket } from '@/context/socket-context'

export const useBusinessBookingRoom = (businessId?: string | null) => {
  const socket = useSocket()

  useEffect(() => {
    if (!businessId) return

    const joinBusinessRoom = () => {
      socket.emit('joinBusinessRoom', { businessId })
    }

    socket.on('connect', joinBusinessRoom)

    if (socket.connected) {
      joinBusinessRoom()
    }

    return () => {
      socket.off('connect', joinBusinessRoom)
    }
  }, [businessId, socket])
}

export const useBookingRealtimeInvalidation = (
  queryKeys: QueryKey[],
  enabled = true
) => {
  const socket = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const handleBookingChanged = () => {
      queryKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey })
      })
    }

    const events = [
      'booking:changed',
      'booking.created',
      'booking.updated',
      'booking.status_updated',
      'booking.progress.updated',
      'booking.item.updated',
      'booking.ready_for_delivery',
      'booking.delivery.claimed',
      'booking.delivered',
      'booking.warning.preparation_delay',
      'booking.warning.delivery_unclaimed',
    ] as const

    events.forEach((eventName) => {
      socket.on(eventName, handleBookingChanged)
    })

    return () => {
      events.forEach((eventName) => {
        socket.off(eventName, handleBookingChanged)
      })
    }
  }, [enabled, queryClient, queryKeys, socket])
}
