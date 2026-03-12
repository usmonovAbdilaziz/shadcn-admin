'use client'

import { StaffBookings } from '@/components/staff/bookings'
import {
  getStaffRouteTarget,
  getStoredStaffPosition,
} from '@/lib/staff-position'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/staff/')({
  beforeLoad: () => {
    const targetRoute = getStaffRouteTarget(getStoredStaffPosition())

    if (targetRoute.to !== '/staff') {
      throw redirect(targetRoute)
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return <StaffBookings />
}
