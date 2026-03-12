export const getBookingStatusLabel = (status?: string) => {
  const normalized = String(status || '').toUpperCase()

  const labels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    CONFIRMED: 'Tasdiqlanmoqda',
    COMPLETED: 'Tasdiqlangan',
    CANCELLED: 'Bekor qilingan',
  }

  return labels[normalized] || normalized || 'Noma`lum'
}

export const getBookingStatusTone = (status?: string) => {
  const normalized = String(status || '').toUpperCase()

  const tones: Record<string, string> = {
    PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    CONFIRMED: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
    COMPLETED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    CANCELLED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  }

  return (
    tones[normalized] || 'border-slate-400/40 bg-slate-500/10 text-slate-200'
  )
}
