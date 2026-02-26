import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCartStore, TeaColor } from '@/store/use-cart-store'
import { toast } from 'sonner'
import { ThermometerSun, Leaf } from 'lucide-react'

interface TeaOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  service: any
}

export const TeaOptionsModal = ({
  isOpen,
  onClose,
  service,
}: TeaOptionsModalProps) => {
  const [teaColor, setTeaColor] = useState<TeaColor>('QORA')
  const [lemon, setLemon] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const LEMON_EXTRA = 2000

  const totalPrice = useMemo(() => {
    if (!service) return 0
    return Number(service.price) + (lemon ? LEMON_EXTRA : 0)
  }, [service, lemon])

  const handleAdd = () => {
    addToCart(service, {
      teaOptions: {
        teaColor,
        lemon,
      },
    })
    toast.success(`${service.name} savatchaga qo'shildi`)
    onClose()
    // Reset defaults for next time
    setTeaColor('QORA')
    setLemon(false)
  }

  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px] rounded-3xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
            <ThermometerSun className='text-primary h-6 w-6' />
            {service.name} variantlarini tanlang
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          {/* Tea Color Selection */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
              Choy turi
            </Label>
            <RadioGroup
              value={teaColor}
              onValueChange={(val) => setTeaColor(val as TeaColor)}
              className='grid grid-cols-2 gap-4'
            >
              <div>
                <RadioGroupItem
                  value='QORA'
                  id='qora'
                  className='peer sr-only'
                />
                <Label
                  htmlFor='qora'
                  className='flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer'
                >
                  <span className='text-sm font-bold'>QORA</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value='KOK' id='kok' className='peer sr-only' />
                <Label
                  htmlFor='kok'
                  className='flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer'
                >
                  <span className='text-sm font-bold'>KO'K</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Lemon Selection */}
          <div className='flex items-center justify-between rounded-2xl border border-border/60 p-4 bg-muted/20'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 p-2 rounded-xl'>
                <Leaf className='text-primary h-5 w-5' />
              </div>
              <div className='space-y-0.5'>
                <Label htmlFor='lemon' className='text-base font-bold'>
                  Limon bilan
                </Label>
                <p className='text-xs text-muted-foreground'>
                  +{LEMON_EXTRA.toLocaleString()} so'm
                </p>
              </div>
            </div>
            <Switch
              id='lemon'
              checked={lemon}
              onCheckedChange={setLemon}
              className='data-[state=checked]:bg-primary'
            />
          </div>

          {/* Price Summary */}
          <div className='flex items-center justify-between border-t border-dashed pt-4'>
            <span className='text-sm font-medium text-muted-foreground'>
              Umumiy narx:
            </span>
            <span className='text-xl font-extrabold text-primary'>
              {totalPrice.toLocaleString()} so'm
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            className='w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
            onClick={handleAdd}
          >
            Savatga qo'shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
