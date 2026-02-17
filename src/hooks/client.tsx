import { useQuery } from '@tanstack/react-query'
import { getClientServices, getClientTable } from '@/api/client'

export const useGetClientTable = (tableId       : string) => {
  return useQuery({
    queryKey: ['client-table', tableId],
    queryFn: () => getClientTable(tableId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
export const useGetClientServices = () => {
  return useQuery({
    queryKey: ['client-services'],
    queryFn: getClientServices,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
