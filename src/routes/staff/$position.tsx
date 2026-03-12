import { StaffBookings } from '@/components/staff/bookings'
import {
  getStaffPositionBySlug,
  getStaffRouteTarget,
  getStoredStaffPosition,
  normalizeStaffPosition,
} from '@/lib/staff-position'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/staff/$position')({
  beforeLoad: ({ params }) => {
    const routePosition = getStaffPositionBySlug(params.position)
    const userPosition = normalizeStaffPosition(getStoredStaffPosition())

    if (!routePosition || !userPosition || routePosition !== userPosition) {
      throw redirect(getStaffRouteTarget(userPosition))
    }
  },
  component: StaffPositionPage,
})

function StaffPositionPage() {
  return <StaffBookings />
}
