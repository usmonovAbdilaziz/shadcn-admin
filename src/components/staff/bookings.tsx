import { useGetStaffBookings, useUpdateBookingStatus } from "@/hooks/staff"
import { useState } from "react";
import { Button } from "../ui/button";
import { BookingList } from "./_components/bookignDetail";
import { Input } from "../ui/input";

export const StaffBookings = () => {
  const staff = JSON.parse(localStorage.getItem('user') || '{}') || ''
  const [searchId,setSearchId]=useState<string>('')
  const [mode,setMode]=useState<"New" | "Archive">("New")
  const [pagination,setPageination]=useState({page:1,size:10})
  const { data: bookings, isLoading, error, refetch } = useGetStaffBookings(staff.position,searchId,pagination)
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateBookingStatus()
  const bookingData = bookings?.data?.items || []
  const newBookings = bookingData.filter((b: any) => b.status !== 'CONFIRMED') || []
  const archiveBookings = bookingData.filter((b: any) => b.status === 'CONFIRMED') || []
  const canUpdateStatus = String(staff?.position || '').toUpperCase() === 'CASHIER'

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id, status })
    await refetch()
  }
  
  return (
    <div className="p-4">
      <div className="flex flex-row justify-between gap-2">
      <Input
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="Search by ID or Phone Number"
      />
      <Button onClick={() => mode === "New" ? setMode("Archive") : setMode("New")}>
        Switch {mode === "New" ? "Archive" : "New"}
      </Button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-destructive">Error loading bookings</p>}

      {mode === "New" && newBookings.length > 0 && (
        <BookingList
          bookings={newBookings}
          canUpdateStatus={canUpdateStatus}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
        />
      )}
      {mode === "New" && newBookings.length === 0 && <p>No new bookings</p>}

      {mode === "Archive" && archiveBookings.length > 0 && (
        <BookingList
          bookings={archiveBookings}
          canUpdateStatus={canUpdateStatus}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
        />
      )}
      {mode === "Archive" && archiveBookings.length === 0 && <p>No archived bookings</p>}
    </div>
  )
}
