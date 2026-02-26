import { ClientProfile } from '@/components/client/Profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ClientProfile />
}
