"use client"
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/routes/business/dashboard'

export const Route = createFileRoute('/business/')({
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
