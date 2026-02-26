'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Separator } from '@radix-ui/react-separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Position } from '@/types/business'
import {
  Check,
  Loader2,
  MoreHorizontal,
  X,
  Save,
  Pencil,
  Trash2,
  Eye,
  Briefcase,
  Clock,
  Info,
  ThumbsUp,
  Workflow,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useAddStaff,
  useDeleteStaff,
  useGetAllServices,
  useGetAllStaffs,
  useUpdateStaff,
} from '@/hooks/business'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Service {
  businessId: string
  category: 'FOODS' | 'DRINKS' | 'DESSERTS' | 'SPECIAL'
  createdAt: string
  description: string
  duration: number
  id: string
  isActive: boolean
  name: string
  photoUrl: string
  price: number
  type: 'HOT' | 'COLD'
  updatedAt: string
}
interface Staff {
  businessId: string
  createdAt: string
  fullName: string
  id: string
  isActive: boolean
  phoneNumber: string
  position: Position
  profilePhoto: string
  reviewCount: number
  services: Service[]
}

const formSchema = z.object({
  businessId: z.string(),
  fullName: z.string({
    error: (iss) =>
      iss.input === '' ? 'Please enter your fullName' : undefined,
  }),
  phoneNumber: z
    .string()
    .min(1, 'Please enter your phoneNumber')
    .min(9, 'Phone number must be at least 9 characters long'),
  position: z.nativeEnum(Position),
  profilePhoto: z.string().optional(),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
})

export function StaffPage() {
  const positions = Object.values(Position)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data: services } = useGetAllServices(user?.business?.id)

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [infoOpen, setInfoOpen] = useState(false)
  const [info, setInfo] = useState<Staff | null>(null)

  const { mutateAsync: updateStaff } = useUpdateStaff()
  const { mutateAsync: deleteStaff } = useDeleteStaff()
  const [open, setOpen] = useState(false)
  const { mutateAsync: addStaff } = useAddStaff()
  const { data, isLoading, refetch } = useGetAllStaffs(user?.business?.id || '')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessId: user?.business?.id,
      fullName: '',
      phoneNumber: '',
      position: undefined,
      profilePhoto: '',
      services: [],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    addStaff(
      {
        ...values,
        businessId: user?.business?.id,
        serviceIds: values.services || [],
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
          toast.success('Staff added successfully')
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to add staff')
        },
      }
    )
  }

  // Inline Edit Handlers
  const handleEditClick = (staff: any) => {
    setEditingId(staff.id)
    setEditFormData({
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      position: staff.position,
      isActive: staff.isActive,
    })
  }

  const handleCancelClick = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const handleInputChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveClick = async () => {
    if (!editingId) return

    try {
      await updateStaff({ staffData: editFormData, staffId: editingId })
      setEditingId(null)
      setEditFormData({})
      toast.success('Staff updated successfully')
      refetch()
    } catch (error: any) {
      console.error('Update Error:', error)
      toast.error('Failed to update staff')
    }
  }

  const handleDelete = (_staffId: string) => {
    deleteStaff(_staffId, {
      onSuccess: () => {
        toast.success('Staff deleted successfully')
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete staff')
      },
    })
  }
  const handleViewDetails = (staff: any) => {
    setInfo(staff)
    setInfoOpen(true)
    console.log(staff)
  }
  const days = (data: string) => {
    const date = new Date(data)
    const dates = new Date()
    const day = dates.getDate()

    const workDay = date.getDate()
    return day - workDay
  }
  return (
    <>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <h1 className='mb-4 text-2xl font-bold'>Staff Management</h1>
          <Button variant='default' onClick={() => setOpen(true)}>
            Add Staff
          </Button>
          <Modal title='Add Staff' open={open} onClose={() => setOpen(false)}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn('grid gap-3')}
              >
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Full Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Phone Number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='position'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a position' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='services'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Services</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange([val])}
                        defaultValue={field.value?.[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select services' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.data?.map((service: any) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='flex-1' disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className='mr-2 size-4 animate-spin' />
                  ) : (
                    <Check className='mr-2 size-4' />
                  )}
                  Create Account
                </Button>
              </form>
            </Form>
          </Modal>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  <Loader2 className='mx-auto h-6 w-6 animate-spin text-gray-400' />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && (!data?.data || data?.data?.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='py-8 text-center text-gray-500'
                >
                  No staff found
                </TableCell>
              </TableRow>
            )}
            {data?.data?.map((staff: any) => {
              const isEditing = staff.id === editingId
              return (
                <TableRow key={staff.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editFormData.fullName}
                        onChange={(e) =>
                          handleInputChange('fullName', e.target.value)
                        }
                      />
                    ) : (
                      staff.fullName
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editFormData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange('phoneNumber', e.target.value)
                        }
                      />
                    ) : (
                      staff.phoneNumber
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editFormData.position}
                        onValueChange={(val) =>
                          handleInputChange('position', val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Position' />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset'>
                        {staff.position}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editFormData.isActive ? 'true' : 'false'}
                        onValueChange={(val) =>
                          handleInputChange('isActive', val === 'true')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='true'>Active</SelectItem>
                          <SelectItem value='false'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : staff.isActive ? (
                      <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset'>
                        Active
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset'>
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className='flex gap-2'>
                        <Button
                          onClick={handleSaveClick}
                          variant='ghost'
                          size='icon'
                          className='bg-green-100 text-green-600 hover:bg-green-200'
                        >
                          <Save className='h-4 w-4' />
                        </Button>
                        <Button
                          onClick={handleCancelClick}
                          variant='ghost'
                          size='icon'
                          className='bg-red-100 text-red-600 hover:bg-red-200'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditClick(staff)}
                          >
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(staff)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDelete(staff.id)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <Modal
          title='Staff Info'
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
        >
          {info && (
            <Card className='bg-card/50 w-full max-w-2xl border-none shadow-lg backdrop-blur'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <div className='space-y-1'>
                  <CardTitle className='text-primary text-2xl font-bold tracking-tight'>
                    {info.fullName}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={info.isActive ? 'default' : 'destructive'}
                      className='animate-pulse'
                    >
                      {info.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant='outline'>{info.phoneNumber}</Badge>
                  </div>
                </div>
                <div className='bg-primary/10 rounded-full p-3'>
                  <Briefcase className='text-primary h-6 w-6' />
                </div>
              </CardHeader>

              <Separator className='mb-4' />

              <CardContent className='grid gap-6'>
                {/* Asosiy Grid ma'lumotlar */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <Info className='h-4 w-4' />
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Position
                      </p>
                      <p className='text-base font-semibold'>{info.position}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <ThumbsUp className='text-muted-foreground mt-0.5 h-5 w-5' />
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Fikir bildirishlar soni:
                      </p>
                      <p className='text-base font-semibold text-green-600'>
                        {info.reviewCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tavsif qismi */}
                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <Clock className='text-muted-foreground mt-0.5 h-5 w-5' />
                    <h4 className='text-sm font-semibold tracking-wider uppercase'>
                      Ishlayapti:
                    </h4>
                  </div>
                  <p className='bg-muted/30 rounded-lg border p-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
                    {days(info.createdAt)} - kun
                  </p>
                </div>

                {/* Xodimlar ro'yxati */}
                <div className='space-y-3'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <Workflow />
                    <h4 className='text-sm font-semibold tracking-wider uppercase'>
                      Assigned services
                    </h4>
                  </div>
                  <div className='h-[120px] overflow-y-auto'>
                    <ScrollArea className='h-full w-full rounded-md p-2'>
                      {info.services?.length === 0 ? (
                        <p className='text-muted-foreground py-4 text-center text-sm'>
                          No services assigned yet.
                        </p>
                      ) : (
                        <div className='grid grid-cols-1 gap-2'>
                          {info?.services?.map((item, index) => (
                            <div
                              key={index}
                              className='hover:bg-muted flex items-center justify-between rounded-md border-b p-2 transition-colors last:border-0'
                            >
                              <div className='flex flex-col'>
                                <span className='text-sm font-medium'>
                                  <span> Nomi:</span> {item.name}
                                </span>
                                <span className='text-muted-foreground text-xs'>
                                  <span> Turi:</span> {item.category}{' '}
                                  {item.type}
                                </span>
                              </div>
                              <Badge variant='outline' className='text-[10px]'>
                                {item.price}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Modal>
      </div>
    </>
  )
}
