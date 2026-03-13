import { BookIcon, LayoutDashboard } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarStaffData: SidebarData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  teams: [
    {
      name: 'Team Alpha',
      logo: 'https://i.pravatar.cc/150?img=1',
      plan: 'Pro',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/staff/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Bookings',
          url: '/staff/bookings',
          icon: BookIcon,
        },
        // {
        //   title: 'Service',
        //   url: '/staff/service',
        //   icon: ServerCog,
        // },
        //  {
        //   title: 'Tables',
        //   url: '/staff/table',
        //   icon: Table,
        // },
        // {
        //   title: 'Booking',
        //   url: '/staff/booking',
        //   icon: Table,
        // },
      ],
    },
  ],
}
