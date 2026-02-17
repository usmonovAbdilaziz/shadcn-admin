import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  Loader2,
  X,
  Save,
  Pencil,
  Trash2,
  Info,
  Briefcase,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useAddService,
  useDeleteService,
  useGetAllServices,
  useUpdateService,
} from '@/hooks/business'
import { Button } from '@/components/ui/button'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'

interface Staff {
  id: string
  fullName: string
  position: string
}
interface Service {
  id: string
  name: string
  category: string
  duration: number
  price: number
  description: string
  type: string
  isActive: boolean
  staff: Staff[]
  photoUrl: string
  liters?: string[]
}

const formSchema = z.object({
  businessId: z.string(),
  name: z.string(),
  category: z.enum(['FOODS', 'DRINKS', 'SWEETS', 'SALADS']),
  type: z.enum(['HOT', 'COLD']),
  description: z.string(),
  duration: z.number(),
  price: z.number(),
  isActive: z.boolean(),
  staff: z.array(z.string()),
  photoUrl: z.any().optional(),
  liters: z.array(z.string()).optional(),
})

export function Service() {
  const Category = ['FOODS', 'DRINKS', 'SWEETS', 'SALADS']
  const LiterOptions = ['0.5', '1', '1.5', '2', '2.5']
  const [open, setOpen] = useState(false)
  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [infoOpen, setInfoOpen] = useState(false)
  const [info, setInfo] = useState<Service>()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data, isLoading, refetch } = useGetAllServices(user?.business?.id)
  const { mutateAsync: deleteService } = useDeleteService()
  const { mutateAsync: updateService } = useUpdateService()
  const { mutateAsync: addService } = useAddService()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessId: user?.business?.id,
      name: '',
      category: undefined,
      type: undefined,
      photoUrl: '',
      description: '',
      duration: 0,
      price: 0,
      isActive: true,
      staff: [],
      liters: [],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append('businessId', values.businessId)
    formData.append('name', values.name)
    formData.append('category', values.category)
    formData.append('type', values.type)
    formData.append('description', values.description)
    formData.append('duration', values.duration.toString())
    formData.append('price', values.price.toString())
    formData.append('isActive', values.isActive.toString())
    if (values.staff.length > 0) {
      formData.append('staff', JSON.stringify(values.staff))
    }
    if (values.liters && values.liters.length > 0) {
      formData.append('liters', JSON.stringify(values.liters))
    }

    if (values.photoUrl && values.photoUrl.length > 0) {
      formData.append('photoUrl', values.photoUrl[0])
    }

    addService(formData, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        toast.success('Service added successfully')
        refetch()
      },
      onError: (error) => {
        console.log(error)
        toast.error('Failed to add service')
      },
    })
  }

  // Inline Edit Handlers
  const handleEditClick = (service: any) => {
    setEditingId(service.id)
    setEditFormData({
      name: service.name,
      category: service.category,
      duration: Number(service.duration),
      price: Number(service.price),
      description: service.description,
      type: service.type,
      isActive: service.isActive,
      liters: service.liters || [],
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

    const hasPhoto = editFormData.photo && editFormData.photo.length > 0
    let payload: any

    // Ensure businessId is included, some backends might need it for context or validation
    const baseData = {
      ...editFormData,
      businessId: user?.business?.id,
    }
    if (hasPhoto) {
      const formData = new FormData()
      // Append all fields from baseData (including businessId)
      Object.keys(baseData).forEach((key) => {
        const value = baseData[key]
        if (key === 'photo') {
          if (value && value.length > 0) formData.append('photoUrl', value[0])
        } else if (key === 'liters') {
          if (value && value.length > 0)
            formData.append(key, JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      payload = formData
    } else {
      // Send JSON object
      const { photo, ...rest } = baseData
      payload = rest
    }

    try {
      await updateService({ serviceData: payload, serviceId: editingId } as any)

      setEditingId(null)
      setEditFormData({})
      toast.success('Service updated successfully')
      refetch()
    } catch (error) {
      console.error('Update Error:', error)
      toast.error('Failed to update service')
    }
  }

  const handleDelete = (serviceId: string) => {
    deleteService(serviceId, {
      onSuccess: () => {
        toast.success('Service deleted successfully')
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete service')
      },
    })
  }

  const handleInfoClick = (service: any) => {
    setInfoOpen(true)
    setInfo(service)
    console.log('Info', service)
  }
  info && console.log('info', info)
  return (
    <>
      <div className='p-6 lg:p-8'>
        <div className='my-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Service List</h1>
          <Button onClick={() => setOpen(true)}>Add Service</Button>
        </div>
        {isLoading ? (
          <Loader2 className='mr-2 size-4 animate-spin' />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data &&
                data?.data?.map((service: any) => {
                  const isEditing = service.id === editingId
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editFormData.name}
                            onChange={(e) =>
                              handleInputChange('name', e.target.value)
                            }
                          />
                        ) : (
                          service.name
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className='flex flex-col gap-2'>
                            {service.photoUrl && (
                              <img
                                src={service.photoUrl}
                                alt={service.name}
                                className='h-10 w-10 rounded-full object-cover'
                              />
                            )}
                            <Input
                              type='file'
                              accept='image/*'
                              onChange={(e) =>
                                handleInputChange('photo', e.target.files)
                              }
                              className='w-[200px]'
                            />
                          </div>
                        ) : service.photoUrl ? (
                          <img
                            src={service.photoUrl}
                            alt={service.name}
                            className='h-10 w-10 rounded-full object-cover'
                          />
                        ) : (
                          <div className='h-10 w-10 rounded-full bg-gray-200' />
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className='flex flex-col gap-2'>
                            <Select
                              value={editFormData.category}
                              onValueChange={(val) =>
                                handleInputChange('category', val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Category' />
                              </SelectTrigger>
                              <SelectContent>
                                {Category.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {editFormData.category === 'DRINKS' && (
                              <div className='flex flex-wrap gap-2 pt-1'>
                                {LiterOptions.map((option) => (
                                  <div
                                    key={option}
                                    className='flex items-center space-x-1'
                                  >
                                    <Checkbox
                                      id={`edit-liter-${option}`}
                                      checked={editFormData.liters?.includes(
                                        option
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current =
                                          editFormData.liters || []
                                        if (checked) {
                                          handleInputChange('liters', [
                                            ...current,
                                            option,
                                          ])
                                        } else {
                                          handleInputChange(
                                            'liters',
                                            current.filter(
                                              (v: string) => v !== option
                                            )
                                          )
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`edit-liter-${option}`}
                                      className='text-[10px] font-medium'
                                    >
                                      {option}L
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='flex flex-col gap-1'>
                            <span>{service.category}</span>
                            {service.category === 'DRINKS' &&
                              service.liters &&
                              service.liters.length > 0 && (
                                <div className='flex flex-wrap gap-1'>
                                  {service.liters.map((l: string) => (
                                    <Badge
                                      key={l}
                                      variant='outline'
                                      className='px-1 py-0 text-[10px]'
                                    >
                                      {l}L
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editFormData.duration}
                            onChange={(e) =>
                              handleInputChange(
                                'duration',
                                e.target.valueAsNumber
                              )
                            }
                          />
                        ) : (
                          service.duration
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editFormData.price}
                            onChange={(e) =>
                              handleInputChange('price', e.target.valueAsNumber)
                            }
                          />
                        ) : (
                          service.price
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editFormData.description}
                            onChange={(e) =>
                              handleInputChange('description', e.target.value)
                            }
                          />
                        ) : (
                          service.description
                        )}
                      </TableCell>
                      <TableCell>
                        {service.staff && service.staff.length > 0
                          ? service.staff.length
                          : null}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={editFormData.type}
                            onValueChange={(val) =>
                              handleInputChange('type', val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='HOT'>Hot</SelectItem>
                              <SelectItem value='COLD'>Cold</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : service.type === 'HOT' ? (
                          <span className='inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800'>
                            Hot
                          </span>
                        ) : (
                          <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                            Cold
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
                        ) : service.isActive ? (
                          <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                            Active
                          </span>
                        ) : (
                          <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'>
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
                          <div className='flex gap-2'>
                            <Button
                              onClick={() => handleEditClick(service)}
                              variant='outline'
                              size='icon'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              onClick={() => handleDelete(service.id)}
                              variant='outline'
                              size='icon'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                            <Button
                              onClick={() => handleInfoClick(service)}
                              variant='outline'
                              size='icon'
                            >
                              <Info className='h-4 w-4' />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        )}
        <Modal title='Add Servie' open={open} onClose={() => setOpen(false)}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn('grid gap-3')}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Xizmat nomi</FormLabel>
                    <FormControl>
                      <Input placeholder='Nomini kiriting' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Category.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('category') === 'DRINKS' && (
                <FormField
                  control={form.control}
                  name='liters'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Liters (for Drinks)</FormLabel>
                      <div className='flex flex-wrap gap-4 pt-2'>
                        {LiterOptions.map((option) => (
                          <div
                            key={option}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={`liter-${option}`}
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                if (checked) {
                                  field.onChange([...current, option])
                                } else {
                                  field.onChange(
                                    current.filter((v: string) => v !== option)
                                  )
                                }
                              }}
                            />
                            <label
                              htmlFor={`liter-${option}`}
                              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {option} L
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='HOT'>Hot</SelectItem>
                        <SelectItem value='COLD'>Cold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='duration'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Duration'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Price'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder='Description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='photoUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        accept='image/*'
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
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
                Create Service
              </Button>
            </form>
          </Form>
        </Modal>
        <Modal
          title='Service Info'
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
        >
          {info && (
            <Card className='bg-card/50 w-full max-w-2xl border-none shadow-lg backdrop-blur'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <div className='space-y-1'>
                  <CardTitle className='text-primary text-2xl font-bold tracking-tight'>
                    {info.name}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='font-medium'>
                      {info.category}
                    </Badge>
                    <Badge
                      variant={info.isActive ? 'default' : 'destructive'}
                      className='animate-pulse'
                    >
                      {info.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                    <Clock className='text-muted-foreground mt-0.5 h-5 w-5' />
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Duration
                      </p>
                      <p className='text-base font-semibold'>
                        {info.duration} min
                      </p>
                    </div>
                  </div>
                  {info.category === 'DRINKS' && info.liters && (
                    <div className='flex items-start gap-3'>
                      <Info className='text-muted-foreground mt-0.5 h-5 w-5' />
                      <div>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Available Volumes
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {info.liters.map((l) => (
                            <Badge key={l} variant='outline'>
                              {l}L
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className='flex items-start gap-3'>
                    <DollarSign className='text-muted-foreground mt-0.5 h-5 w-5' />
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Price
                      </p>
                      <p className='text-base font-semibold text-green-600'>
                        ${info.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tavsif qismi */}
                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <Info className='h-4 w-4' />
                    <h4 className='text-sm font-semibold tracking-wider uppercase'>
                      Description
                    </h4>
                  </div>
                  <p className='bg-muted/30 rounded-lg border p-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
                    {info.description}
                  </p>
                </div>

                {/* Xodimlar ro'yxati */}
                <div className='space-y-3'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    <h4 className='text-sm font-semibold tracking-wider uppercase'>
                      Assigned Staff
                    </h4>
                  </div>
                  <div className='h-[120px] overflow-y-auto'>
                    <ScrollArea className='h-full w-full rounded-md p-2'>
                      {info.staff?.length === 0 ? (
                        <p className='text-muted-foreground py-4 text-center text-sm'>
                          No staff assigned yet.
                        </p>
                      ) : (
                        <div className='grid grid-cols-1 gap-2'>
                          {info.staff.map((item, index) => (
                            <div
                              key={index}
                              className='hover:bg-muted flex items-center justify-between rounded-md border-b p-2 transition-colors last:border-0'
                            >
                              <div className='flex flex-col'>
                                <span className='text-sm font-medium'>
                                  {item.fullName}
                                </span>
                                <span className='text-muted-foreground text-xs'>
                                  {item.position}
                                </span>
                              </div>
                              <Badge variant='outline' className='text-[10px]'>
                                Team Member
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
