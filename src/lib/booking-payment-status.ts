export const getBookingPaymentStatusLabel = (status?: string | null) => {
  const normalized = String(status || '').toUpperCase()

  const labels: Record<string, string> = {
    PENDING: "To'lov kutilmoqda",
    COMPLETED: "To'landi",
    CANCELLED: "To'lov bekor qilingan",
  }

  return labels[normalized] || normalized || "Noma'lum"
}

export const getBookingPaymentStatusTone = (status?: string | null) => {
  const normalized = String(status || '').toUpperCase()

  const tones: Record<string, string> = {
    PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    COMPLETED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    CANCELLED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  }

  return (
    tones[normalized] || 'border-slate-400/40 bg-slate-500/10 text-slate-200'
  )
}

export const isBookingPaid = (status?: string | null) =>
  String(status || '').toUpperCase() === 'COMPLETED'
