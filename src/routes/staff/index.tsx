import { createFileRoute } from '@tanstack/react-router'
import { StaffDashboard } from './dashboard'

export const Route = createFileRoute('/staff/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if(user.userType !== 'STAFF') {
    window.location.href = '/'
  }
  return <StaffDashboard/>
}
