import { useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getStaffPositionLabel } from '@/lib/staff-position'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const [staffPositionLabel, setStaffPositionLabel] = useState<string | null>(
    null
  )
  const href = useLocation({ select: (location) => location.href })

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setStaffPositionLabel(getStoredStaffPositionLabel())
  }, [href])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        {staffPositionLabel ? (
          <div className='hidden min-w-0 sm:flex sm:items-center'>
            <span className='rounded-md border border-border/60 bg-muted/30 px-3 py-1 text-sm font-medium text-foreground/90'>
              {staffPositionLabel}
            </span>
          </div>
        ) : null}
        <Separator orientation='vertical' className='h-6' />
        {children}
      </div>
    </header>
  )
}

const getStoredStaffPositionLabel = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

    if (storedUser?.userType !== 'STAFF') {
      return null
    }

    return getStaffPositionLabel(storedUser.position)
  } catch {
    return null
  }
}
