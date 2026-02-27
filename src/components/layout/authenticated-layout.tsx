import { Outlet, useNavigate } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { ProfileDropdown } from '../profile-dropdown'
import { Search } from '../search'
import { ThemeSwitch } from '../theme-switch'
import { Header } from './header'
import { useEffect } from 'react'
import axios from 'axios'
import { baseApi } from '@/api/baseApi'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

const AUTH_FAILURE_STATUSES = new Set([401, 403, 404])

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const navigate = useNavigate()

  useEffect(() => {
    let isCancelled = false
    let timer: ReturnType<typeof setInterval> | null = null

    const validateSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        if (!isCancelled) navigate({ to: '/sign-in', replace: true })
        return
      }

      // Prevent duplicate calls on React StrictMode remount in dev.
      const lastCheckAt = Number(sessionStorage.getItem('auth_me_last_check') ?? 0)
      const now = Date.now()
      if (now - lastCheckAt < 5000) return
      sessionStorage.setItem('auth_me_last_check', String(now))

      try {
        await axios.get(`${baseApi}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        if (isCancelled || !axios.isAxiosError(error)) return
        const status = error.response?.status
        if (status && AUTH_FAILURE_STATUSES.has(status)) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate({ to: '/sign-in', replace: true })
        }
      }
    }

    void validateSession()
    timer = setInterval(() => {
      void validateSession()
    }, 60_000)

    return () => {
      isCancelled = true
      if (timer) clearInterval(timer)
    }
  }, [navigate])

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider
          defaultOpen={defaultOpen}
          className='h-svh overflow-hidden'
        >
          <SkipToMain />
          <AppSidebar />
          <SidebarInset>
            <Header>
              <div className='ms-auto flex items-center space-x-4'>
                <Search />
                <ThemeSwitch />
                <ProfileDropdown />
              </div>
            </Header>
            <div className='m-2 flex flex-1 flex-col gap-4 overflow-auto rounded-lg border border-gray-300 dark:border-gray-800'>
              {children ?? <Outlet />}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
