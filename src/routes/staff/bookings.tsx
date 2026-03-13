import { StaffBookings } from '@/components/staff/bookings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/staff/bookings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StaffBookings />
}
