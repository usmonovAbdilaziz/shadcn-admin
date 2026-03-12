export enum Position {
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  COOK = 'COOK',
  BARMAN = 'BARMEN',
  RUNNER = 'RUNNER',
  CLEANER = 'CLEANER',
  WAITER = 'WAITER',
}
export interface AddStaff {
  businessId: string
  fullName: string
  phoneNumber: string
  position: Position
  serviceIds: string[]
  profilePhoto?: string
}
export interface AddService {
  businessId: string
  name: string
  category: string
  description: string
  duration: number
  price: number
  staffIds: string[]
}

export interface AddTable {
  id?: string
  businessId: string
  tableNumber: number
  tableColumns: string
  status: 'BUSY' | 'CLEANED' | 'EMPTY'
}
