import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import axios from 'axios'
import { baseApi } from '@/api/baseApi'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem('token')?.trim()
    const rawUser = localStorage.getItem('user')

    if (!token || token === 'null' || token === 'undefined' || !rawUser) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }

    try {
      const meResponse = await axios.get(`${baseApi}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const me = meResponse.data?.data
      const role = me?.role as string | undefined

      if (role !== 'ADMIN') {
        throw redirect({
          to:
            role === 'BUSINESS'
              ? '/business'
              : role === 'STAFF'
                ? '/staff'
                : role === 'CLIENT'
                  ? '/client'
                  : '/sign-in',
        })
      }
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error

      const status = error.response?.status
      if (!status || [401, 403, 404].includes(status)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        throw redirect({ to: '/sign-in', search: { redirect: location.href } })
      }

      throw error
    }
  },
  component: AuthenticatedLayout,
})
