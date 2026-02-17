
import { LayoutDashboard, Users, ServerCog,  Users2Icon } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarAdminData: SidebarData = {
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
          url: '/admin',
          icon: LayoutDashboard,
        },
        {
          title: 'Staff',
          url: '/admin/users',
          icon: Users,
        },
        {
          title: 'Service',
          url: '/admin/service',
          icon: ServerCog,
        },
        {
          title:"Business",
          url:'/admin/business',
          icon:Users2Icon
        }
      ],
    },
  ],
}

function userFunc() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user
}
