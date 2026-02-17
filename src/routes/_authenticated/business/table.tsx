import { createFileRoute } from '@tanstack/react-router'
import { BusinessTable } from '@/components/business/table'

export const Route = createFileRoute('/_authenticated/business/table')({
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
      <BusinessTable />
    </div>
  )
}
