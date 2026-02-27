import { useMutation, useQuery } from '@tanstack/react-query'
import { createOrder, getOrderStatus } from '@/api/order'
import { useClientStore } from '@/store/use-client-store'

export const useCreateOrder = () => {
  const token = useClientStore((s) => s.token)

  return useMutation({
    mutationFn: ({ tableId, items }: { tableId: string; items: any[] }) =>
      createOrder(tableId, items, token),
  })
}

export const useGetOrderStatus = (orderId: string, enabled = false) => {
  return useQuery({
    queryKey: ['order-status', orderId],
    queryFn: () => getOrderStatus(orderId),
    enabled,
    refetchInterval: (query) => {
      // @ts-ignore
      const status = query.state.data?.data?.status
      return status === 'CONFIRMED' ? false : 3000
    },
  })
}
