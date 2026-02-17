import { createFileRoute } from '@tanstack/react-router'
import { Service } from '@/components/business/service'

export const Route = createFileRoute('/_authenticated/business/service')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Service />
}
