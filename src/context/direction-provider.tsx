import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DirectionProvider as RdxDirProvider } from '@radix-ui/react-direction'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

export type Direction = 'ltr' | 'rtl'

const DEFAULT_DIRECTION: Direction = 'ltr'
const DIRECTION_COOKIE_NAME = 'dir'
const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type DirectionContextType = {
  defaultDir: Direction
  dir: Direction
  setDir: (dir: Direction) => void
  resetDir: () => void
}

const DirectionContext = createContext<DirectionContextType | null>(null)

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [dir, _setDir] = useState<Direction>(() => {
    const saved = getCookie(DIRECTION_COOKIE_NAME) as Direction | undefined
    return saved || DEFAULT_DIRECTION
  })

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
  }, [dir])

  const setDir = (nextDir: Direction) => {
    _setDir(nextDir)
    setCookie(DIRECTION_COOKIE_NAME, nextDir, DIRECTION_COOKIE_MAX_AGE)
  }

  const resetDir = () => {
    _setDir(DEFAULT_DIRECTION)
    removeCookie(DIRECTION_COOKIE_NAME)
  }

  const value = useMemo(
    () => ({
      defaultDir: DEFAULT_DIRECTION,
      dir,
      setDir,
      resetDir,
    }),
    [dir]
  )

  return (
    <DirectionContext.Provider value={value}>
      <RdxDirProvider dir={dir}>{children}</RdxDirProvider>
    </DirectionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
  const context = useContext(DirectionContext)
  if (!context) throw new Error('useDirection must be used within a DirectionProvider')
  return context
}