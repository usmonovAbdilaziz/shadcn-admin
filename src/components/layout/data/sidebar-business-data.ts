import { LayoutDashboard, Users, ServerCog, Table } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarBusinessData: SidebarData = {
  user: {
    name: userFunc().fullName,
    email: userFunc().email,
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'EaseBooking',
      logo: '/logo/logo.png',
      plan: 'EaseBooking',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/business',
          icon: LayoutDashboard,
        },
        {
          title: 'Staff',
          url: '/business/users',
          icon: Users,
        },
        {
          title: 'Service',
          url: '/business/service',
          icon: ServerCog,
        },
         {
          title: 'Tables',
          url: '/business/table',
          icon: Table,
        },
        {
          title: 'Booking',
          url: '/business/booking',
          icon: Table,
        },
      ],
    },
  ],
}
function userFunc() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user
}
