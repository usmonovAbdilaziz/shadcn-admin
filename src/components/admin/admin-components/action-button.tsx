import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { IBusinessData } from '@/types/admin'
import { Edit, Eye, Trash2 } from 'lucide-react'

interface ActionButtonsProps {
  data: IBusinessData
  onDelete: (id: string) => void
  onEdit: (data: IBusinessData) => void
}

export const ActionButtons = ({ data, onDelete, onEdit }: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Biznes Tafsilotlari</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-bold">Nomi:</span> {data.businessName}
              </p>
              <p>
                <span className="font-bold">Turi:</span> {data.businessType}
              </p>
              <p>
                <span className="font-bold">Manzil:</span> {data.city}, {data.address}
              </p>
              <p>
                <span className="font-bold">Status:</span>{' '}
                {data.isApproved ? 'Tasdiqlangan' : 'Kutilmoqda'}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-bold">Egasi:</span> {data.user.fullName}
              </p>
              <p>
                <span className="font-bold">Email:</span> {data.user.email}
              </p>
              <p>
                <span className="font-bold">Tel:</span> {data.phone}
              </p>
              <p>
                <span className="font-bold">ID:</span> {data.id}
              </p>
            </div>
            <div className="col-span-2 border-t pt-2">
              <p>
                <span className="font-bold">Tavsif:</span> {data.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="icon" onClick={() => onEdit(data)}>
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>

      <Button variant="outline" size="icon" onClick={() => onDelete(data.id)}>
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}