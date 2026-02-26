import { BookingPage } from '@/components/business/booking'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/business/booking')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BookingPage/>
}
