import {
    claimBookingDelivery,
    completeBookingDelivery,
    staffBookings,
    staffUpdate,
    updateBookingItemProgress,
    updateBookingStatus,
} from "@/api/staff"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetStaffBookings = (
    position: string,
    options?: {
        search?: string
        status?: string
        dateFrom?: string
        dateTo?: string
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

const invalidateBookingQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['staff-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['business-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['client-bookings'] }),
    ])
}

export const useUpdateBookingItemProgress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['booking-item-progress'],
        mutationFn: (payload: { bookingId: string; itemId: string; status: string }) =>
            updateBookingItemProgress(payload.bookingId, payload.itemId, payload.status),
        onSuccess: async () => {
            await invalidateBookingQueries(queryClient)
        },
    })
}

export const useClaimBookingDelivery = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['booking-delivery-claim'],
        mutationFn: (bookingId: string) => claimBookingDelivery(bookingId),
        onSuccess: async () => {
            await invalidateBookingQueries(queryClient)
        },
    })
}

export const useCompleteBookingDelivery = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['booking-delivery-complete'],
        mutationFn: (bookingId: string) => completeBookingDelivery(bookingId),
        onSuccess: async () => {
            await invalidateBookingQueries(queryClient)
        },
    })
}
