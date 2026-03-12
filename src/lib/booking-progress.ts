import { getStaffPositionLabel, normalizeStaffPosition } from './staff-position'

export const getBookingProgressLabel = (status?: string | null) => {
  const normalized = String(status || '').trim().toUpperCase()

  const labels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    PREPARING: 'Tayyorlanmoqda',
    READY_FOR_DELIVERY: 'Yetkazishga tayyor',
    DELIVERING: 'Yetkazilmoqda',
    DELIVERED: 'Yetkazildi',
    CANCELLED: 'Bekor qilingan',
  }

  return labels[normalized] || normalized || 'Noma`lum'
}

export const getBookingProgressTone = (status?: string | null) => {
  const normalized = String(status || '').trim().toUpperCase()

  const tones: Record<string, string> = {
    PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    PREPARING: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
    READY_FOR_DELIVERY: 'border-violet-400/40 bg-violet-500/10 text-violet-200',
    DELIVERING: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
    DELIVERED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    CANCELLED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  }

  return (
    tones[normalized] || 'border-slate-400/40 bg-slate-500/10 text-slate-200'
  )
}

export const getBookingItemProgressLabel = (status?: string | null) => {
  const normalized = String(status || '').trim().toUpperCase()

  const labels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    PREPARING: 'Tayyorlanmoqda',
    READY: 'Tayyor',
    CANCELLED: 'Bekor qilingan',
  }

  return labels[normalized] || normalized || 'Noma`lum'
}

export const getBookingItemProgressTone = (status?: string | null) => {
  const normalized = String(status || '').trim().toUpperCase()

  const tones: Record<string, string> = {
    PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    PREPARING: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
    READY: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    CANCELLED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  }

  return (
    tones[normalized] || 'border-slate-400/40 bg-slate-500/10 text-slate-200'
  )
}

export const getResponsibleRoleLabel = (position?: string | null) => {
  const normalized = normalizeStaffPosition(position)
  return normalized ? getStaffPositionLabel(normalized) : null
}
