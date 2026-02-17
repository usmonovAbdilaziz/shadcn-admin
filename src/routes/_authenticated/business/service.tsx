import { createFileRoute } from '@tanstack/react-router'
import { Service } from '@/components/business/service'

export const Route = createFileRoute('/_authenticated/business/service')({
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
  return <Service />
}
