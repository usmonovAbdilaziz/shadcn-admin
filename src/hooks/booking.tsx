import { useMutation, useQuery } from "@tanstack/react-query"
import { createBooking, getClientBookings } from "../api/booking"

type CreateBookingPayload = Parameters<typeof createBooking>[0]

export const useCreateBooking = (token?: string | null) => {
    return useMutation({
        mutationKey: ["create-booking"],
        mutationFn: (booking: CreateBookingPayload) => createBooking(booking, token),
    })
}

export const useGetClientBookings = (
    clientId: string,
    token?: string | null,
    params?: Record<string, string | number | undefined>,
) => {
    return useQuery({
        queryKey: ['client-bookings', clientId, token, params],
        queryFn: () => getClientBookings(clientId, params, token),
        enabled: !!clientId,
    })
}
