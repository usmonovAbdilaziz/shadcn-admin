'use client'

import { createFileRoute } from '@tanstack/react-router'
import { StaffDashboard } from '@/features/staff/dashboard'

export const Route = createFileRoute('/staff/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <StaffDashboard />
}
