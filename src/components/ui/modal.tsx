import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
type CustomModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: CustomModalProps) {
  // ESC bosilganda yopish
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 m-4'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <div
          className={cn(
            'bg-background animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl shadow-xl',
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className='flex items-center justify-between border-b p-4'>
              <h2 className='text-lg font-semibold'>{title}</h2>
              <button
                onClick={onClose}
                className='text-muted-foreground hover:bg-muted rounded-md p-1'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}

          {/* Content */}
          <div className='p-4'>{children}</div>
        </div>
      </div>
    </div>
  )
}
