"use client"
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Dashboard } from '@/features/business/dashboard'
import { useEffect } from 'react';

export const Route = createFileRoute('/business/')({
  component: RouteComponent,
})
function RouteComponent() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token"); // token nomini o'zgartiring agar farq bo'lsa
    if (!token) {
      navigate({ to: '/sign-in' });
    }
  }, []);
  const user = JSON.parse(localStorage.getItem("user") || '{}');
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
