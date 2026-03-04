"use client"
import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from './dashboard'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if(user.userType !== 'ADMIN') {
    window.location.href = '/business'
  }
  return <AdminDashboard/>
}
