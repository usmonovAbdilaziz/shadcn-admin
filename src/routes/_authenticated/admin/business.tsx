import { AdminBusiness } from '@/components/admin/business'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/business')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-8"><AdminBusiness/></div>
}
