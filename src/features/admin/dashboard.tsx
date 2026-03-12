import { useEffect, useState } from 'react'

export const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (currentUser.userType !== 'ADMIN') {
      window.location.href = '/business'
    }
    setUser(currentUser)
  }, [])

  return <div>Hello "/admin/dashboard"! {user?.fullName}</div>
}
