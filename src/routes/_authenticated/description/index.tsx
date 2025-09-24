import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Description } from '@/features/description'

// Search param schema for description
const descriptionSearchSchema = z.object({
  filter: z.string().optional(),
  type: z.enum(['all', 'connected', 'notConnected']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/_authenticated/description/')({
  validateSearch: descriptionSearchSchema,
  component: Description,
})
