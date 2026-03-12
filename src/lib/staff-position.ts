export const STAFF_POSITIONS = [
  'MANAGER',
  'CASHIER',
  'COOK',
  'BARMEN',
  'RUNNER',
  'CLEANER',
  'WAITER',
] as const

export type StaffPosition = (typeof STAFF_POSITIONS)[number]
export type StaffPositionSlug =
  | 'manager'
  | 'cashier'
  | 'cook'
  | 'barman'
  | 'runner'
  | 'cleaner'
  | 'waiter'

export type StaffPositionRoute =
  | '/staff/manager'
  | '/staff/cashier'
  | '/staff/cook'
  | '/staff/barman'
  | '/staff/runner'
  | '/staff/cleaner'
  | '/staff/waiter'

export type StaffRouteTarget =
  | {
      to: '/staff'
    }
  | {
      to: '/staff/$position'
      params: {
        position: StaffPositionSlug
      }
    }

const POSITION_TO_SLUG: Record<StaffPosition, StaffPositionSlug> = {
  MANAGER: 'manager',
  CASHIER: 'cashier',
  COOK: 'cook',
  BARMEN: 'barman',
  RUNNER: 'runner',
  CLEANER: 'cleaner',
  WAITER: 'waiter',
}

const SLUG_TO_POSITION: Record<StaffPositionSlug, StaffPosition> = {
  manager: 'MANAGER',
  cashier: 'CASHIER',
  cook: 'COOK',
  barman: 'BARMEN',
  runner: 'RUNNER',
  cleaner: 'CLEANER',
  waiter: 'WAITER',
}

const POSITION_LABELS: Record<StaffPosition, string> = {
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  COOK: 'Cook',
  BARMEN: 'Barman',
  RUNNER: 'Runner',
  CLEANER: 'Cleaner',
  WAITER: 'Waiter',
}

export const normalizeStaffPosition = (
  position?: string | null
): StaffPosition | null => {
  const normalized = String(position || '').toUpperCase()

  if (normalized === 'CHEF') {
    return 'COOK'
  }

  if (normalized === 'BARMAN') {
    return 'BARMEN'
  }

  if ((STAFF_POSITIONS as readonly string[]).includes(normalized)) {
    return normalized as StaffPosition
  }

  return null
}

export const getStaffPositionSlug = (
  position?: string | null
): StaffPositionSlug | null => {
  const normalized = normalizeStaffPosition(position)
  return normalized ? POSITION_TO_SLUG[normalized] : null
}

export const getStaffRouteByPosition = (
  position?: string | null
): StaffPositionRoute | '/staff' => {
  const slug = getStaffPositionSlug(position)
  return slug ? (`/staff/${slug}` as StaffPositionRoute) : '/staff'
}

export const getStaffRouteTarget = (
  position?: string | null
): StaffRouteTarget => {
  const slug = getStaffPositionSlug(position)

  if (!slug) {
    return { to: '/staff' }
  }

  return {
    to: '/staff/$position',
    params: { position: slug },
  }
}

export const getStaffPositionBySlug = (
  slug?: string | null
): StaffPosition | null => {
  if (!slug) return null

  if ((Object.keys(SLUG_TO_POSITION) as StaffPositionSlug[]).includes(slug as StaffPositionSlug)) {
    return SLUG_TO_POSITION[slug as StaffPositionSlug]
  }

  return null
}

export const getStaffPageTitle = (position?: string | null) => {
  const normalized = normalizeStaffPosition(position)
  return normalized ? `${POSITION_LABELS[normalized]} Sahifasi` : 'Staff Sahifasi'
}

export const getStaffPositionLabel = (position?: string | null) => {
  const normalized = normalizeStaffPosition(position)
  return normalized ? POSITION_LABELS[normalized] : null
}

export const getStoredStaffPosition = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    return storedUser?.position as string | undefined
  } catch {
    return undefined
  }
}
