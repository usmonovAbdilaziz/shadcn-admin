export enum Position {
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  WAITRESS = 'WAITRESS',
  COOK = 'COOK',
  BARISTA = 'BARISTA',
  HOST = 'HOST',
  HOSTESS = 'HOSTESS',
  MANAGER = 'MANAGER',
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
