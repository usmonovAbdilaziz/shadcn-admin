import { createFileRoute } from '@tanstack/react-router'
import { StaffPage } from '@/components/business/staff-page'

export const Route = createFileRoute('/_authenticated/business/users')({
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
    <div>
      <StaffPage />
    </div>
  )
}
