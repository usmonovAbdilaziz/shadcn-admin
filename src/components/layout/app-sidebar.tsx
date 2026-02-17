// import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarBusinessData } from './data/sidebar-business-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useEffect, useState } from 'react'
import { SidebarData } from './types'
import { sidebarAdminData } from './data/sidebar-admin-data'

export function AppSidebar() {
  const [sidebarData,setSidebarData]=useState<SidebarData>(sidebarBusinessData)
  const user = JSON.parse(localStorage.getItem("user")!)

  useEffect(()=>{
if(user){
  if(user.userType==='BUSINESS'){
    setSidebarData(sidebarBusinessData)
  }else if(user.userType==='ADMIN'){
    setSidebarData(sidebarAdminData)
  }
}
  },[user])
  // const { collapsible, variant } = useLayout()
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
