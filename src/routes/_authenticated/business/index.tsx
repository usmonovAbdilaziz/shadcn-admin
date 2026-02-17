import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/business/')({
  component: RouteComponent,
})
function RouteComponent() {
  const user =JSON.parse(localStorage.getItem("user")!)
  if(user){
    if(user.userType !== 'BUSINESS') {
      window.location.href = '/admin'
    }
  }else{
      window.location.href = '/'
  }
  return (
    <>
      <Dashboard />
    </>
  )
}
