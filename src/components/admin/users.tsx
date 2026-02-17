import { useAdminUserManagementUpdate, useAdminUsers, useAdminUserUpdate } from "@/hooks/admin"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {  IAdminUsers, UpdateUsers } from "@/types/admin";
import { toast } from "sonner";
import { Button } from "../ui/button";

export const AdminUsers = () => {
    const {data:users,refetch}=useAdminUsers()
    const {mutate:userManagement}=useAdminUserManagementUpdate()
    const {mutate:userUpdateAll}=useAdminUserUpdate()
    const handleConfirm =(id:string,verified:boolean)=>{
        const nextPosition = verified ? 'enable' : 'disable'
        userManagement({id,position: nextPosition},{
            onSuccess: () => {
             toast.success('Service deleted successfully')
             refetch()
            },
            onError: (error: any) => {
             toast.error(error.message || 'Failed to delete service')
            },
        })

    }
    const handleUpdate=(id:string,updateData:UpdateUsers)=>{
        userUpdateAll({id,userData:updateData},{
            onSuccess: () => {
             toast.success('Service deleted successfully')
             refetch()
            },
            onError: (error: any) => {
             toast.error(error.message || 'Failed to delete service')
            },
        }
        )
    }
    console.log(users);
    
  return <div className="p-8">
    <h1>Users Management</h1>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone number</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Working</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users?.data&&users?.data?.map((user:IAdminUsers)=>{
            return(
                <TableRow key={user.id}>
                    <TableCell>
                        {user.fullName}
                    </TableCell>
                    <TableCell>
                        {user.email}
                    </TableCell>
                    <TableCell>
                        {user.phoneNumber}
                    </TableCell>
                    <TableCell>
                        {user.userType}
                    </TableCell>
                    <TableCell>
                        <Button onClick={()=>handleConfirm(user.id,user.isActive)}>
                            {user.isActive?"Active":"Inactive"}
                        </Button>
                    </TableCell>
                    <TableCell >
                            {user.isVerified?"Approved":"NotApproved"}
                    </TableCell>
                    <TableCell>
                        <Button onClick={()=>handleUpdate(user.id,user)}>
                            change
                        </Button>
                    </TableCell>
                </TableRow>
            )
            })}
            
        </TableBody>
    </Table>
    </div>
}