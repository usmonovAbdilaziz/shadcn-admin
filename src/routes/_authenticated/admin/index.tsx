import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if(user.userType !== 'ADMIN') {
    window.location.href = '/business'
  }
  return <div>Hello "/_authenticated/admin/"! {user.fullName}</div>
}
