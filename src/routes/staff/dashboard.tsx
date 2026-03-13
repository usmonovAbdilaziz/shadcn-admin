import { StaffDashboard } from '@/features/staff/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/staff/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return <StaffDashboard />
}
