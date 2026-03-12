import { staffBookings, staffUpdate, updateBookingStatus } from "@/api/staff"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useGetStaffBookings = (
    position: string,
    bookingId: string,
    pagination?: { page: number; size: number },
) => {
    return useQuery({
        queryKey: ['staff-bookings', position, bookingId, pagination],
        queryFn: () => staffBookings(position, bookingId, pagination),
        enabled: !!position,
    })
}
export const useUpdateStaff = (id:string) => {
    return useMutation({
        mutationKey: ['staff-update', id],
        mutationFn: (data: any) => staffUpdate(id, data),
    })
}

export const useUpdateBookingStatus = () => {
    return useMutation({
        mutationKey: ['booking-status'],
        mutationFn: (payload: { id: string; status: string }) =>
            updateBookingStatus(payload.id, payload.status),
    })
}
