import { useMutation, useQuery } from '@tanstack/react-query'
import { createOrder, getOrderStatus } from '@/api/order'

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: ({ tableId, items }: { tableId: string; items: any[] }) => 
      createOrder(tableId, items),
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
