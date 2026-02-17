import { ClientDashboard } from '@/components/client/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ClientDashboard />
}
