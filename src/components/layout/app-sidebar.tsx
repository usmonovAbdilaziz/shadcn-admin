// import { useLayout } from '@/context/layout-provider'
import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { sidebarAdminData } from './data/sidebar-admin-data';
// import { AppTitle } from './app-title'
import { sidebarBusinessData } from './data/sidebar-business-data';
import { sidebarStaffData } from './data/sidebar-staff-data';
import { NavGroup } from './nav-group';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher'
import { SidebarData } from './types'


export function AppSidebar() {
  const [sidebarData,setSidebarData]=useState<SidebarData>(sidebarBusinessData)
  const user = JSON.parse(localStorage.getItem("user")!)

  useEffect(()=>{
if(user){
  if(user.userType==='BUSINESS'){
    setSidebarData(sidebarBusinessData)
  }else if(user.userType==='ADMIN'){
    setSidebarData(sidebarAdminData)
  }else if(user.userType==='STAFF'){
    setSidebarData(sidebarStaffData)
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