import { createFileRoute } from '@tanstack/react-router'
import { Character } from '@/features/character'

export const Route = createFileRoute('/_authenticated/character/')({
  component: Character,
})
