export type BookingApprovalStage =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'

type ApprovalBookingLike = {
  status?: string | null
  priceStatus?: string | null
  progressStatus?: string | null
}

const normalizeValue = (value?: string | null) => String(value || '').toUpperCase()

export const isBookingApprovalCancelled = (booking: ApprovalBookingLike) => {
  const status = normalizeValue(booking.status)
  const priceStatus = normalizeValue(booking.priceStatus)

  return status === 'CANCELLED' || priceStatus === 'CANCELLED'
}

export const isBookingApprovalPaid = (booking: ApprovalBookingLike) =>
  normalizeValue(booking.priceStatus) === 'COMPLETED'

export const canConfirmBookingApproval = (booking: ApprovalBookingLike) =>
  normalizeValue(booking.status) === 'PENDING' &&
  !isBookingApprovalCancelled(booking)

export const canMarkBookingApprovalPaid = (booking: ApprovalBookingLike) =>
  !isBookingApprovalCancelled(booking) &&
  !isBookingApprovalPaid(booking) &&
  normalizeValue(booking.progressStatus) === 'DELIVERED'

export const getBookingApprovalStage = (
  booking: ApprovalBookingLike
): BookingApprovalStage => {
  const status = normalizeValue(booking.status)

  if (isBookingApprovalCancelled(booking)) {
    return 'CANCELLED'
  }

  if (isBookingApprovalPaid(booking)) {
    return 'PAID'
  }

  if (status === 'PENDING' || canMarkBookingApprovalPaid(booking)) {
    return 'PENDING'
  }

  return 'CONFIRMED'
}

export const getBookingApprovalStatusLabel = (
  stage?: BookingApprovalStage | null
) => {
  const labels: Record<BookingApprovalStage, string> = {
    PENDING: 'Kutilmoqda',
    CONFIRMED: 'Tasdiqlangan',
    PAID: "To'landi",
    CANCELLED: 'Bekor qilingan',
  }

  if (!stage) {
    return "Noma'lum"
  }

  return labels[stage] || stage
}

export const getBookingApprovalStatusTone = (
  stage?: BookingApprovalStage | null
) => {
  const tones: Record<BookingApprovalStage, string> = {
    PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    CONFIRMED: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
    PAID: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    CANCELLED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  }

  if (!stage) {
    return 'border-slate-400/40 bg-slate-500/10 text-slate-200'
  }

  return tones[stage] || 'border-slate-400/40 bg-slate-500/10 text-slate-200'
}
