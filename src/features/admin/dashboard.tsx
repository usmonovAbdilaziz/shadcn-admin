import { useEffect, useState } from "react"

export const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null)
 useEffect(()=>{
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if(user.userType !== 'ADMIN') {
    window.location.href = '/business'
  }
  setUser(user)
})
return <div>Hello "/admin/dashboard"! {user.fullName}</div>
}