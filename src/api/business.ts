import axios from 'axios'
import { AddService, AddStaff, AddTable } from '@/types/business'
import { baseApiv1 } from './baseApi'

//staff
export const getAllStaffs = async (businessId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${baseApiv1}/staff/business/${businessId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const addStaff = async (staffData: AddStaff) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${baseApiv1}/staff`, staffData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const updateStaff = async (staffData: AddStaff, staffId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.patch(`${baseApiv1}/staff/${staffId}`, staffData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const deleteStaff = async (staffId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${baseApiv1}/staff/${staffId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
//service
export const addService = async (serviceData: AddService | FormData) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${baseApiv1}/service`, serviceData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const updateService = async (
  serviceData: AddService | FormData,
  serviceId: string
) => {
  const token = localStorage.getItem('token')
  const res = await axios.patch(
    `${baseApiv1}/service/${serviceId}`,
    serviceData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res.data
}
export const getAllServices = async (businessId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${baseApiv1}/service?businessId=${businessId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const deleteService = async (serviceId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${baseApiv1}/service/${serviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const getAllTables = async (businessId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${baseApiv1}/table/business/${businessId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const addTable = async (tableData: AddTable) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${baseApiv1}/table`, tableData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const deleteTable = async (tableId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${baseApiv1}/table/${tableId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export const updateTable = async (tableData: AddTable, tableId: string) => {
  const token = localStorage.getItem('token')
  const res = await axios.patch(`${baseApiv1}/table/${tableId}`, tableData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

