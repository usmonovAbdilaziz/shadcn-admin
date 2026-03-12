import { useMutation, useQuery } from '@tanstack/react-query'
import type { UpdateUsers } from '@/types/admin'
import {
  adminGetService,
  adminUserDetails,
  adminUserUpdate,
  adminUsers,
  adminUsersManagementUpdate,
  getBusinessAll,
} from '@/api/admin'

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUsers,
    staleTime: 2 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}
export const useAdminUserDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-user-details', id],
    queryFn: () => adminUserDetails(id),
    enabled: !!id,
  })
}
export const useGetAdminService = (id: string) => {
  return useQuery({
    queryKey: ['admin-service', id],
    queryFn: () => adminGetService(id),
  })
}

export const useAdminUserManagementUpdate = () => {
  return useMutation({
    mutationFn: ({ id, position }: { id: string; position: string }) =>
      adminUsersManagementUpdate(id, position),
    mutationKey: ['admin-users'],
  })
}
export const useAdminGetBusinesses = () => {
  return useQuery({
    queryKey: ['user-business'],
    queryFn: getBusinessAll,
    staleTime: 2 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}
export const useAdminUserUpdate = () => {
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUsers }) =>
      adminUserUpdate(id, userData),
    mutationKey: ['admin-users'],
  })
}