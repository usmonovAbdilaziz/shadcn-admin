import { createFileRoute } from '@tanstack/react-router'
import { BusinessTable } from '@/components/business/table'

export const Route = createFileRoute('/business/table')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <BusinessTable />
    </div>
  )
}
