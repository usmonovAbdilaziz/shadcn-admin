import { useGetAdminService } from "@/hooks/admin"
import { useDeleteService, useUpdateService } from "@/hooks/business"
import { useState } from "react"
import { ServiceDetailsModal, ServiceItem } from "./admin-components/services-table"
import { Button } from "../ui/button"
import dayjs from "dayjs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Badge } from "../ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { toast } from "sonner"
import {
  Eye,
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react"

export const AdminServices = () => {
  const [serviceId, setServiceId] = useState("")
  const {
    data: serviceData,
    isSuccess: serviceSuccess,
    refetch,
  } = useGetAdminService(serviceId)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ServiceItem | null>(null)

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null)
  const { mutateAsync: deleteService, isPending: isDeleting } = useDeleteService()

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService()

  const serviceList: ServiceItem[] = Array.isArray(serviceData?.data)
    ? serviceData?.data
    : serviceData?.data
      ? [serviceData.data as ServiceItem]
      : []

  const url = "http://localhost:3002"
  const categories = ["FOODS", "DRINKS", "SWEETS", "SALADS"]
  const types = ["HOT", "COLD"]

  // View handler
  const handleView = (row: ServiceItem) => {
    setSelected(row)
    setOpen(true)
  }

  // Delete handlers
  const handleDeleteClick = (service: ServiceItem) => {
    setDeleteTarget(service)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteService(deleteTarget.id)
      toast.success("Service muvaffaqiyatli o'chirildi")
      setDeleteOpen(false)
      setDeleteTarget(null)
      refetch()
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "O'chirishda xatolik yuz berdi"
      toast.error(message)
    }
  }

  // Edit handlers
  const handleEditClick = (service: ServiceItem) => {
    setEditingId(service.id)
    setEditData({
      name: service.name || "",
      category: service.category || "",
      type: service.type || "",
      price: service.price || 0,
      duration: service.duration || 0,
      description: service.description || "",
      isActive: service.isActive ?? true,
    })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    if (!editingId) return
    try {
      await updateService({
        serviceData: editData,
        serviceId: editingId,
      } as any)
      toast.success("Service muvaffaqiyatli yangilandi")
      setEditingId(null)
      setEditData({})
      refetch()
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Yangilashda xatolik yuz berdi"
      toast.error(message)
    }
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-4">
        <h1 className="text-2xl font-bold">Services</h1>
        <Input
          placeholder="Search serviceId"
          className="w-64"
          onChange={(e) => setServiceId(e.target.value)}
        />
      </div>

      <ServiceDetailsModal open={open} onOpenChange={setOpen} data={selected} />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5" />
                O'chirishni tasdiqlang
              </DialogTitle>
              <DialogDescription className="text-red-100">
                Bu amalni ortga qaytarib bo'lmaydi
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm">
              <span className="font-semibold">"{deleteTarget?.name}"</span> servisini
              o'chirmoqchimisiz? Bu amal qaytarilmaydi.
            </p>
            {deleteTarget && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono text-foreground">{deleteTarget.id}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Category: <span className="font-medium text-foreground">{deleteTarget.category}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Price: <span className="font-medium text-foreground">{deleteTarget.price}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteTarget(null)
              }}
              disabled={isDeleting}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Ha, o'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Categoriy</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Bajarilishi</TableHead>
            <TableHead>Sharh</TableHead>
            <TableHead>Foydalanilayapti</TableHead>
            <TableHead>Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceSuccess &&
            serviceList.length > 0 &&
            serviceList.map((service: ServiceItem) => {
              const isEditing = service.id === editingId
              return (
                <TableRow key={service.id}>
                  {/* Name */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                        className="h-8 w-32"
                      />
                    ) : (
                      service.name
                    )}
                  </TableCell>

                  {/* Image */}
                  <TableCell>
                    <img
                      width="50"
                      height="50"
                      src={`${url}${service.photoUrl}`}
                      alt=""
                      className="rounded-md object-cover"
                    />
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editData.category}
                        onValueChange={(val) => handleEditChange("category", val)}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      service.category
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editData.type}
                        onValueChange={(val) => handleEditChange("type", val)}
                      >
                        <SelectTrigger className="h-8 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      service.type
                    )}
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.price}
                        onChange={(e) =>
                          handleEditChange("price", e.target.valueAsNumber)
                        }
                        className="h-8 w-24"
                      />
                    ) : (
                      service.price
                    )}
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editData.duration}
                          onChange={(e) =>
                            handleEditChange("duration", e.target.valueAsNumber)
                          }
                          className="h-8 w-20"
                        />
                        <span className="text-xs text-muted-foreground">min</span>
                      </div>
                    ) : (
                      `${service.duration} min`
                    )}
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editData.description}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                        className="h-8 w-40"
                      />
                    ) : (
                      service.description
                    )}
                  </TableCell>

                  {/* Days */}
                  <TableCell>
                    {dayjs().diff(dayjs(service.createdAt), "day")}-kun
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={handleEditSave}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={handleEditCancel}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => handleView(service)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditClick(service)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(service)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}
