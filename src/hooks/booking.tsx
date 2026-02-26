import { useMutation } from "@tanstack/react-query"
import { createBooking } from "../api/booking"
export const useCreateBooking = () => {
    return useMutation({
        mutationKey: ["create-booking"],
        mutationFn: (booking: any) => createBooking(booking),
    })
}