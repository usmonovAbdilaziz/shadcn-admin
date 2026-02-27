import { useQuery } from '@tanstack/react-query'
import { getBusenessAll, getClientMe, getClientServices, getClientTable } from '@/api/client'
export const useGetClientBusiness = () => {
  return useQuery({
    queryKey: ['client-business' ],  
    queryFn: () => getBusenessAll(),
    staleTime: 5 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
  })
}
export const useGetClientTable = (params: any) => {
  return useQuery({
    queryKey: ['client-table', params],
    queryFn: () => getClientTable(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!(params?.businessId || params?.tableId),
  })
}
export const useGetClientServices = (businessId: string) => {
  return useQuery({
    queryKey: ['client-services', businessId],
    queryFn: () => getClientServices(businessId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
export const useGetClientMe = (token: string) => {
  return useQuery({
    queryKey: ['client-me', token],
    queryFn: () => getClientMe(token),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000, 
    enabled:!!token,
  })
}   
