import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import MapPicker from '@/components/ui/map'

interface MapModalProps {
  value: { lat: number; lng: number }
  onChange: (coords: { lat: number; lng: number }) => void
}

export function MapModal({ value, onChange }: MapModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          type='button'
          className='flex w-full items-center justify-between px-4 py-6'
        >
          <div className='flex items-center gap-2'>
            <MapPin className='text-primary size-5' />
            <div className='text-left'>
              <p className='text-sm font-medium'>Select Location</p>
              <p className='text-muted-foreground text-xs'>
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <span className='text-primary text-sm font-medium'>Change</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Select your business location</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <MapPicker value={value} onChange={onChange} />
        </div>
        <div className='mt-4 flex justify-end'>
          <Button type='button' onClick={() => setIsOpen(false)}>
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
