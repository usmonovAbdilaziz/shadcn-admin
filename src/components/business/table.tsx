import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddTable } from '@/types/business'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  Trash,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAddTable,
  useDeleteTable,
  useGetAllTables,
  useUpdateTable,
} from '@/hooks/business'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Modal } from '../ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

const tableSchema = z.object({
  businessId: z.string(),
  tableNumber: z.number(),
  tableColumns: z.string().regex(/^[A-Z]+$/),
  status: z.enum(['BUSY', 'CLEANED', 'EMPTY']),
})

const bulkTableSchema = z.object({
  startColumn: z.string().regex(/^[A-Z]$/),
  endColumn: z.string().regex(/^[A-Z]$/),
  startNumber: z.number().min(1),
  endNumber: z.number().max(100),
})

export const BusinessTable = () => {
  const user = JSON.parse(localStorage.getItem('user')!)
  const [open, setOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<AddTable>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: 'tableNumber' | 'tableColumns' | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const { data: tables, refetch } = useGetAllTables(user?.business.id!)
  const { mutateAsync: addTable } = useAddTable()
  const { mutateAsync: deleteTable } = useDeleteTable()
  const { mutateAsync: updateTable } = useUpdateTable()
  const form = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      businessId: user?.business.id,
      tableNumber: 0,
      tableColumns: '',
      status: 'EMPTY',
    },
  })

  const bulkForm = useForm<z.infer<typeof bulkTableSchema>>({
    resolver: zodResolver(bulkTableSchema),
    defaultValues: {
      startColumn: 'A',
      endColumn: 'D',
      startNumber: 1,
      endNumber: 12,
    },
  })
  function onSubmit(values: z.infer<typeof tableSchema>) {
    addTable(values, {
      onSuccess: () => {
        toast.success('Table added successfully')
        form.reset()
        setOpen(false)
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to add table')
      },
    })
  }
  const handleDelete = (id: string) => {
    if (!id) {
      toast.error('Table ID is required')
      return
    }
    deleteTable(id, {
      onSuccess: () => {
        toast.success('Table deleted successfully')
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete table')
      },
    })
  }
  const handleEditClick = (table: AddTable) => {
    setEditingId(table.id!)
    setEditForm(table)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    updateTable(
      { tableData: editForm as AddTable, tableId: editingId },
      {
        onSuccess: () => {
          toast.success('Table updated successfully')
          setEditingId(null)
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update table')
        },
      }
    )
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const confirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId)
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const handleSort = (key: 'tableNumber' | 'tableColumns') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedTables = useMemo(() => {
    if (!tables?.data) return []
    const sortableTables = [...tables.data]
    if (sortConfig.key) {
      sortableTables.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableTables
  }, [tables?.data, sortConfig])

  const onBulkSubmit = async (values: z.infer<typeof bulkTableSchema>) => {
    setIsBulkCreating(true)
    let successCount = 0
    let errorCount = 0

    const startCharCode = values.startColumn.charCodeAt(0)
    const endCharCode = values.endColumn.charCodeAt(0)

    try {
      for (let charCode = startCharCode; charCode <= endCharCode; charCode++) {
        const col = String.fromCharCode(charCode)
        for (let num = values.startNumber; num <= values.endNumber; num++) {
          try {
            await addTable({
              businessId: user?.business.id,
              tableNumber: num,
              tableColumns: col,
              status: 'EMPTY',
            })
            successCount++
          } catch (error) {
            errorCount++
          }
        }
      }
      toast.success(
        `Bulk creation finished! Success: ${successCount}, Failed: ${errorCount}`
      )
      setBulkOpen(false)
      refetch()
    } finally {
      setIsBulkCreating(false)
    }
  }

  return (
    <div className='flex flex-col gap-4 p-12'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Table Management</h1>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setBulkOpen(true)}
            disabled={isBulkCreating}
          >
            {isBulkCreating ? 'Creating...' : 'Auto Create'}
          </Button>
          <Button variant='default' onClick={() => setOpen(true)}>
            Add Table
          </Button>
        </div>
      </div>
      <Modal title='Add Table' open={open} onClose={() => setOpen(false)}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-3'
          >
            <FormField
              control={form.control}
              name='tableNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Number</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Table Number'
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
              name='tableColumns'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Columns</FormLabel>
                  <FormControl>
                    <Input placeholder='Table Columns' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  {/* Select FormControldan TASHQARIDA bo'lishi kerak */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='EMPTY'>Empty</SelectItem>
                      <SelectItem value='BUSY'>Busy</SelectItem>
                      <SelectItem value='CLEANED'>Cleaned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='mt-4 w-full'>
              Add Table
            </Button>
          </form>
        </Form>
      </Modal>
      <Modal
        title='Bulk Create Tables'
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
      >
        <Form {...bulkForm}>
          <form
            onSubmit={bulkForm.handleSubmit(onBulkSubmit)}
            className='flex flex-col gap-3'
          >
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={bulkForm.control}
                name='startColumn'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Column (A-Z)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        maxLength={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkForm.control}
                name='endColumn'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Column (A-Z)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        maxLength={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={bulkForm.control}
                name='startNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Number</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkForm.control}
                name='endNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Number</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type='submit'
              className='mt-4 w-full'
              disabled={isBulkCreating}
            >
              {isBulkCreating ? 'Creating...' : 'Start Creation'}
            </Button>
          </form>
        </Form>
      </Modal>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className='hover:bg-muted/50 cursor-pointer transition-colors'
              onClick={() => handleSort('tableNumber')}
            >
              <div className='flex items-center gap-1'>
                Table Number
                {sortConfig.key === 'tableNumber' ? (
                  sortConfig.direction === 'asc' ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )
                ) : (
                  <ArrowUpDown className='h-3 w-3 opacity-50' />
                )}
              </div>
            </TableHead>
            <TableHead
              className='hover:bg-muted/50 cursor-pointer transition-colors'
              onClick={() => handleSort('tableColumns')}
            >
              <div className='flex items-center gap-1'>
                Table Columns
                {sortConfig.key === 'tableColumns' ? (
                  sortConfig.direction === 'asc' ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )
                ) : (
                  <ArrowUpDown className='h-3 w-3 opacity-50' />
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Settings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTables &&
            sortedTables.map((table: AddTable) => {
              const isEditing = editingId === table.id
              return (
                <TableRow key={table.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type='number'
                        value={editForm.tableNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tableNumber: e.target.valueAsNumber,
                          })
                        }
                        className='w-20'
                      />
                    ) : (
                      table.tableNumber
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editForm.tableColumns}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase() // Kichik yozsa ham avtomatik katta qiladi
                          // Faqat A-Z oraliqdagi harflarni qoldiradi, qolganini o'chirib tashlaydi
                          const filteredVal = val.replace(/[^A-Z]/g, '')

                          setEditForm({
                            ...editForm,
                            tableColumns: filteredVal,
                          })
                        }}
                        placeholder='FAQAT KATTA HARFLAR (A-Z)'
                      />
                    ) : (
                      table.tableColumns
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editForm.status}
                        onValueChange={(value: 'EMPTY' | 'BUSY' | 'CLEANED') =>
                          setEditForm({ ...editForm, status: value })
                        }
                      >
                        <SelectTrigger className='w-32'>
                          <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='EMPTY'>Empty</SelectItem>
                          <SelectItem value='BUSY'>Busy</SelectItem>
                          <SelectItem value='CLEANED'>Cleaned</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          table.status === 'EMPTY'
                            ? 'bg-green-100 text-green-700'
                            : table.status === 'BUSY'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {table.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className='flex items-center gap-2'>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={handleSaveEdit}
                          className='text-green-600 hover:text-green-700'
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={handleCancelEdit}
                          className='text-red-600 hover:text-red-700'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(table)}
                          >
                            <Edit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setDeleteId(table.id!)
                              setShowDeleteDialog(true)
                            }}
                            className='text-red-600'
                          >
                            <Trash className='mr-2 h-4 w-4' /> Delete
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
