import axios from "axios"
import { baseApiv1 } from "./baseApi"
import {  UpdateUsers } from "@/types/admin"
const adminUrl = `${baseApiv1}/admin`

const getBearerConfig = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
}

export const adminUsers = async() => {
    const res = await axios.get(`${adminUrl}/users`, getBearerConfig())
    return  res.data
}
export const getBusinessAll =async ()=>{
    const res = await axios.get(`${adminUrl}/businesses`,getBearerConfig())
    return res.data
}
export const adminUsersManagementUpdate= async (id:string,position:string)=>{
    
    
    const res = await axios.post(
      `${adminUrl}/user-management/users/${id}/${position}`,
      undefined,
      getBearerConfig(),
    )
    return res.data
}
export const adminUserUpdate= async (id:string,userData:UpdateUsers)=>{
   
    
    const res =await axios.patch(`${adminUrl}/users/${id}`,userData,getBearerConfig())
    return res.data
}
