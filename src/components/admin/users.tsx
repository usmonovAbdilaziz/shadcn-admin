import { useState } from 'react'
import { IAdminUsers, UpdateUsers } from '@/types/admin'
import { toast } from 'sonner'
import {
  useAdminUserDetails,
  useAdminUserManagementUpdate,
  useAdminUsers,
  useAdminUserUpdate,
} from '@/hooks/admin'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

export const AdminUsers = () => {
  const [open, setOpen] = useState(false)
  const [selectUserId, setSelectUserId] = useState<string | null>(null)
  const { data: users, refetch } = useAdminUsers()
  const {
    data: userDetailsResponse,
    isSuccess: userDetailsSuccess,
  } = useAdminUserDetails(selectUserId as string)
  const selectedUser = (userDetailsResponse as any)?.data ?? userDetailsResponse
  const { mutate: userManagement } = useAdminUserManagementUpdate()
  const { mutate: userUpdateAll } = useAdminUserUpdate()

  const handleConfirm = (id: string, verified: boolean) => {
    const nextPosition = verified ? 'enable' : 'disable'
    userManagement(
      { id, position: nextPosition },
      {
        onSuccess: () => {
          toast.success('User status updated')
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update status')
        },
      }
    )
  }
  const handleUpdate = (id: string, user: IAdminUsers) => {
    const userOnlyFields: UpdateUsers = {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      position: user.position,
      isActive: user.isActive,
      isVerified: user.isVerified,
      profilePhoto: user.profilePhoto,
      telegramUsername: user.telegramUsername,
      gender: user.gender,
      email: user.email,
    }

    userUpdateAll(
      { id, userData: userOnlyFields },
      {
        onSuccess: () => {
          toast.success('User updated successfully')
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update user')
        },
      }
    )
  }
  const handleInfo = (id: string) => {
    setSelectUserId(id)
    setOpen(true)
  }
  return (
    <div className='p-8'>
      <h1>Users Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Phone number</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Working</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.data &&
            users?.data?.map((user: IAdminUsers) => {
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.business.businessName}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.position}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleConfirm(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleUpdate(user.id, user)}>
                      change
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleInfo(user.id)}>View</Button>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) setSelectUserId(null)
        }}
      >
        {userDetailsSuccess && selectedUser && (
          <DialogContent className='max-w-2xl overflow-hidden rounded-2xl p-0'>
            {/* Header */}
            <div className='bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white'>
              <DialogHeader>
                <DialogTitle className='text-xl font-semibold'>
                  Staff Profile
                </DialogTitle>
                <DialogDescription className='text-slate-200'>
                  Staff and business information
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className='space-y-6 p-6'>
              {/* Staff info */}
              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage src={selectedUser.profilePhoto ?? ''} />
                  <AvatarFallback className='text-lg'>
                    {selectedUser?.fullName?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className='text-lg font-semibold'>
                    {selectedUser.fullName}
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    {selectedUser.phoneNumber}
                  </p>

                  <div className='mt-2 flex gap-2'>
                    <Badge variant='secondary'>{selectedUser.position}</Badge>

                    {selectedUser?.isActive ? (
                      <Badge className='bg-green-500'>Active</Badge>
                    ) : (
                      <Badge variant='destructive'>Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
              {/* Business Info */}
              <div className='space-y-3'>
                <h4 className='text-base font-semibold'>
                  Business Information
                </h4>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-muted-foreground'>Business Name</p>
                    <p className='font-medium'>
                      {selectedUser?.business?.businessName}
                    </p>
                  </div>

                  <div>
                    <p className='text-muted-foreground'>Type</p>
                    <p className='font-medium capitalize'>
                      {selectedUser?.business?.businessType}
                    </p>
                  </div>

                  <div>
                    <p className='text-muted-foreground'>City</p>
                    <p className='font-medium'>
                      {selectedUser?.business?.city}
                    </p>
                  </div>

                  <div>
                    <p className='text-muted-foreground'>Phone</p>
                    <p className='font-medium'>
                      {selectedUser?.business?.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className='text-muted-foreground text-sm'>Address</p>
                  <p className='font-medium'>
                    {selectedUser?.business?.address}
                  </p>
                </div>

                <div>
                  <p className='text-muted-foreground text-sm'>Description</p>
                  <p className='text-sm'>
                    {selectedUser?.business?.description}
                  </p>
                </div>

                <div className='mt-2 flex gap-2'>
                  {selectedUser?.business?.isApproved ? (
                    <Badge className='bg-green-500'>Approved</Badge>
                  ) : (
                    <Badge variant='destructive'>Not Approved</Badge>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h1>Services</h1>
              {selectedUser?.services?.map((service: any) => (
                <div
                  key={service.id}
                  className='mb-2 flex flex-row gap-3 rounded-md border p-4'
                >
                  <h2 className='font-semibold'>ID</h2>
                  <span>{service.serviceId}</span>
                </div>
              ))}
            </div>

            <DialogFooter className='px-6 pb-6'>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
        {userDetailsSuccess && !selectedUser && (
          <div className='text-muted-foreground p-4 text-sm'>No user data</div>
        )}
      </Dialog>
    </div>
  )
}
