export const getBookingConfirmerTypeLabel = (type?: string | null) => {
  const normalized = String(type || '').trim().toUpperCase()

  if (normalized === 'BUSINESS_OWNER') {
    return 'Business egasi'
  }

  if (normalized === 'MANAGER') {
    return 'Manager'
  }

  if (normalized === 'CASHIER') {
    return 'Cashier'
  }

  return null
}

export const getBookingConfirmerSummary = (booking: {
  confirmedByType?: string | null
  confirmedByName?: string | null
}) => {
  const roleLabel = getBookingConfirmerTypeLabel(booking.confirmedByType)
  const actorName = String(booking.confirmedByName || '').trim()

  if (roleLabel && actorName) {
    return `${roleLabel}: ${actorName}`
  }

  if (actorName) {
    return actorName
  }

  return roleLabel
}
