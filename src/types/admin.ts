export interface IAdminUsers {
  createdAt: string
  email: string
  fullName: string
  gender: string
  id: string
  isActive: boolean
  isVerified: boolean
  password: string
  phoneNumber: string
  profilePhoto: string | null
  telegramUsername: string | null
  updatedAt: string
  position: string
  business:IBusinessData
}
export  interface UpdateUsers extends Partial<IAdminUsers>{}

export interface IBusinessUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  userType: string;
}

export interface IBusinessData {
  id: string;
  businessName: string;
  businessType: string;
  city: string;
  address: string;
  description: string;
  phone: string;
  isApproved: boolean;
  latitude: number;
  longitude: number;
  user: IBusinessUser;
}
