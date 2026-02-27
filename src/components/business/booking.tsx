import { useGetAllBooking } from "@/hooks/business"
import LoadingBar from "react-top-loading-bar";

export const BookingPage = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const businessId = user?.business?.id || ""
    const { data:bookings, isLoading } = useGetAllBooking(businessId)
    console.log("bookings",bookings);
    if(isLoading) {
        return <div><LoadingBar progress={30} /></div>
    }
    return <div>BookingPage</div>
}
