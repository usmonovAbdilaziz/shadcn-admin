import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AddService, AddStaff, AddTable } from '@/types/business'
import {
  addService,
  addStaff,
  addStaffToService,
  addTable,
  allBusinessBooking,
  deleteService,
  deleteStaff,
  deleteTable,
  getAllServices,
  getAllStaffByBusinessId,
  getAllStaffs,
  getAllTables,
  updateService,
  updateStaff,
  updateTable,
} from '@/api/business'

//staff
export const useGetAllStaffs = (businessId: string) => {
  return useQuery({
    queryKey: ['staffs'],
    queryFn: () => getAllStaffs(businessId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
export const useUpdateStaff = () => {
  return useMutation({
    mutationFn: ({
      staffData,
      staffId,
    }: {
      staffData: AddStaff
      staffId: string
    }) => updateStaff(staffData, staffId),
    mutationKey: ['staffs'],
  })
}
export const useDeleteStaff = () => {
  return useMutation({
    mutationFn: (staffId: string) => deleteStaff(staffId),
    mutationKey: ['staffs'],
  })
}
export const useAddStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (staffData: AddStaff) => addStaff(staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
    },
    mutationKey: ['staffs'],
  })
}
//service
export const useAddService = () => {
  return useMutation({
    mutationFn: (serviceData: AddService | FormData) => addService(serviceData),
    mutationKey: ['services'],
  })
}
export const useUpdateService = () => {
  return useMutation({
    mutationFn: ({
      serviceData,
      serviceId,
    }: {
      serviceData: AddService | FormData
      serviceId: string
    }) => updateService(serviceData, serviceId),
    mutationKey: ['services'],
  })
}
export const useGetAllServices = (businessId: string) => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => getAllServices(businessId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
export const useDeleteService = () => {
  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),
    mutationKey: ['services'],
  })
}
export const useGetAllTables = (businessId: string) => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => getAllTables(businessId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
export const useAddTable = () => {
  return useMutation({
    mutationFn: (tableData: AddTable) => addTable(tableData),
    mutationKey: ['tables'],
  })
}
export const useDeleteTable = () => {
  return useMutation({
    mutationFn: (tableId: string) => deleteTable(tableId),
    mutationKey: ['tables'],
  })
}
export const useUpdateTable = () => {
  return useMutation({
    mutationFn: ({
      tableData,
      tableId,
    }: {
      tableData: AddTable
      tableId: string
    }) => updateTable(tableData, tableId),
    mutationKey: ['tables'],
  })
}
//staff
export const useGetAllStaffByBusinessId = (businessId: string) => {
  return useQuery({
    queryKey: ['staffs'],
    queryFn: () => getAllStaffByBusinessId(businessId),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
export const useAddStaffToService=(serviceId:string)=>{
  return useMutation({
    mutationFn: (data:any) => addStaffToService(serviceId,data),
    mutationKey: ['services'],
  })
}
export const useGetAllBooking=(businessId:string, page=1, size=10)=>{
  return useQuery({
    queryKey: ['bookings', businessId, page, size],
    queryFn: () => allBusinessBooking(businessId, { page, size }),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!businessId,
  })
}
