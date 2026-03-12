"use client"

import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/business'

export const Route = createFileRoute('/business/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <Dashboard />
}
