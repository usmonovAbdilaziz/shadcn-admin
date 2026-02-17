import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/business/')({
  component: RouteComponent,
})
function RouteComponent() {
  return (
    <>
      <Dashboard />
    </>
  )
}
