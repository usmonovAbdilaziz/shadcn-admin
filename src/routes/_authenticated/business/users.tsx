import { createFileRoute } from '@tanstack/react-router'
import { StaffPage } from '@/components/business/staff-page'

export const Route = createFileRoute('/_authenticated/business/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <StaffPage />
    </div>
  )
}
