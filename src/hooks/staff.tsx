import { staffBookings, staffUpdate, updateBookingStatus } from "@/api/staff"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetStaffBookings = (
    position: string,
    options?: {
        search?: string
        status?: string
        pagination?: { page: number; size: number }
    },
) => {
    return useQuery({
        queryKey: ['staff-bookings', position, options],
        queryFn: () => staffBookings(position, options),
        enabled: !!position,
    })
}
export const useUpdateStaff = (id:string) => {
    return useMutation({
        mutationKey: ['staff-update', id],
        mutationFn: (data: unknown) => staffUpdate(id, data),
    })
}

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['booking-status'],
        mutationFn: (payload: { id: string; status: string }) =>
            updateBookingStatus(payload.id, payload.status),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['staff-bookings'] }),
                queryClient.invalidateQueries({ queryKey: ['business-bookings'] }),
                queryClient.invalidateQueries({ queryKey: ['client-bookings'] }),
            ])
        },
    })
}
