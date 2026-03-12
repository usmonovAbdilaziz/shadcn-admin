import { AdminServices } from '@/components/admin/services'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/service')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminServices/>
}
