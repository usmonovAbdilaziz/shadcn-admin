import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getBookingItemProgressLabel,
  getBookingItemProgressTone,
  getBookingProgressLabel,
  getBookingProgressTone,
  getResponsibleRoleLabel,
} from '@/lib/booking-progress'
import {
  getBookingConfirmerSummary,
  getBookingConfirmerTypeLabel,
} from '@/lib/booking-confirmer'
import { cn } from '@/lib/utils'

type BookingItem = {
  id?: string
  productId?: string
  serviceId?: string
  qty?: number
  priceSnapshot?: number
  price?: number
  note?: string | null
  status?: string | null
  responsiblePosition?: string | null
  service?: {
    name?: string
  } | null
  product?: {
    name?: string
  } | null
}

type Booking = {
  id: string
  createdAt: string
  updatedAt: string
  status: string
  price?: number | string | null
  notes?: string | null
  businessId?: string | null
  clientId?: string | null
  staffId?: string | null
  serviceId?: string | null
  tableId?: string | null
  idempotencyKey?: string | null
  confirmedAt?: string | null
  confirmedByType?: string | null
  confirmedByName?: string | null
  progressStatus?: string | null
  estimatedDurationMinutes?: number | null
  estimatedReadyAt?: string | null
  readyForDeliveryAt?: string | null
  deliveryAssignedName?: string | null
  deliveryAssignedRole?: string | null
  deliveredAt?: string | null
  deliveredByName?: string | null
  deliveredByRole?: string | null
  isDelayedPreparation?: boolean
  isDelayedDeliveryClaim?: boolean
  outstandingPreparationRoles?: string[] | null
  client?: {
    fullName?: string | null
    phoneNumber?: string | null
    [key: string]: unknown
  } | null
  staff?: {
    [key: string]: unknown
  } | null
  table?: {
    tableNumber?: number | null
    tableColumns?: string | null
    [key: string]: unknown
  } | null
  service?: {
    [key: string]: unknown
  } | null
  items?: BookingItem[]
}

type BookingTableProps = {
  data: Booking[]
  page?: number
  totalPages?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  canUpdateStatus?: boolean
  onStatusChange?: (id: string, status: string) => void | Promise<void>
  isUpdating?: boolean
}

const statusLabel = (s: string) =>
  s === 'CONFIRMED'
    ? 'Tasdiqlangan'
    : s === 'PENDING'
      ? 'Kutilmoqda'
      : s === 'CANCELLED'
        ? 'Bekor qilingan'
        : s === 'COMPLETED'
          ? 'Yakunlangan'
          : s

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'CONFIRMED'
  const isPending = status === 'PENDING'
  const isCancelled = status === 'CANCELLED'
  const isCompleted = status === 'COMPLETED'

  return (
    <Badge
      variant={isConfirmed ? 'default' : 'secondary'}
      className={[
        isConfirmed ? 'bg-emerald-500 hover:bg-emerald-600' : '',
        isPending ? 'bg-amber-500 text-white hover:bg-amber-600' : '',
        isCancelled ? 'bg-rose-500 text-white hover:bg-rose-600' : '',
        isCompleted ? 'bg-sky-500 text-white hover:bg-sky-600' : '',
      ].join(' ')}
    >
      {statusLabel(status)}
    </Badge>
  )
}

function ProgressBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      variant='outline'
      className={cn('border', getBookingProgressTone(status))}
    >
      {getBookingProgressLabel(status)}
    </Badge>
  )
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

function money(v?: number | string | null) {
  const n = Number(v ?? 0)
  return `${n.toLocaleString('uz-UZ')} so'm`
}

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )
}

function ObjectView({ data }: { data?: Record<string, unknown> | null }) {
  const entries = Object.entries(data || {})
  return (
    <div className='grid gap-2 sm:grid-cols-2'>
      {entries.map(([k, v]) => (
        <KeyValue
          key={k}
          label={k}
          value={typeof v === 'object' ? JSON.stringify(v) : String(v)}
        />
      ))}
    </div>
  )
}

function ItemsView({ items }: { items?: BookingItem[] }) {
  if (!items?.length)
    return <div className='text-muted-foreground text-sm'>Items yo‘q</div>

  const total = items.reduce(
    (sum, it) => sum + Number(it.priceSnapshot ?? 0) * Number(it.qty ?? 0),
    0
  )

  return (
    <div className='space-y-2'>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service/Product</TableHead>
              <TableHead className='text-right'>Qty</TableHead>
              <TableHead className='text-right'>Price</TableHead>
              <TableHead className='text-right'>Sum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => {
              const name =
                it?.service?.name ||
                it?.product?.name ||
                it.productId ||
                it.serviceId
              const qty = Number(it.qty ?? 0)
              const price = Number(it.priceSnapshot ?? it.price ?? 0)
              return (
                <TableRow key={it.id ?? `${name}-${qty}-${price}`}>
                  <TableCell>
                    <div className='flex flex-wrap items-center gap-2'>
                      <div className='font-medium'>{name}</div>
                      {it.status ? (
                        <Badge
                          variant='outline'
                          className={cn(
                            'border',
                            getBookingItemProgressTone(it.status)
                          )}
                        >
                          {getBookingItemProgressLabel(it.status)}
                        </Badge>
                      ) : null}
                      {it.responsiblePosition ? (
                        <Badge variant='secondary'>
                          {getResponsibleRoleLabel(it.responsiblePosition) ||
                            it.responsiblePosition}
                        </Badge>
                      ) : null}
                    </div>
                    {it.note ? (
                      <div className='text-muted-foreground text-xs whitespace-pre-wrap'>
                        Izoh: {it.note}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className='text-right'>{qty}</TableCell>
                  <TableCell className='text-right'>{money(price)}</TableCell>
                  <TableCell className='text-right'>
                    {money(price * qty)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-end'>
        <div className='text-sm'>
          <span className='text-muted-foreground mr-2'>Items total:</span>
          <span className='text-lg font-bold'>{money(total)}</span>
        </div>
      </div>
    </div>
  )
}

function ExpandRow({
  booking,
  canUpdateStatus,
  onStatusChange,
  isUpdating,
}: {
  booking: Booking
  canUpdateStatus?: boolean
  onStatusChange?: (id: string, status: string) => void | Promise<void>
  isUpdating?: boolean
}) {
  const confirmerSummary = getBookingConfirmerSummary(booking)
  const confirmerTypeLabel = getBookingConfirmerTypeLabel(booking.confirmedByType)
  const status = String(booking.status || '').toUpperCase()
  const canAct = Boolean(canUpdateStatus && onStatusChange)
  const actions: Array<{ label: string; status: string }> = []

  if (status === 'PENDING') {
    actions.push({ label: 'Tasdiqlash', status: 'CONFIRMED' })
    actions.push({ label: 'Bekor qilish', status: 'CANCELLED' })
  } else if (status === 'CONFIRMED') {
    actions.push({ label: 'Tasdiqlandi', status: 'COMPLETED' })
    actions.push({ label: 'Bekor qilish', status: 'CANCELLED' })
  }

  return (
    <div className='bg-muted/20 space-y-4 rounded-md border p-4'>
      <div className='grid gap-3 md:grid-cols-2'>
        <div className='space-y-2'>
          <div className='text-muted-foreground text-xs font-semibold'>
            CLIENT
          </div>
          <ObjectView data={booking.client} />
        </div>
        <div className='space-y-2'>
          <div className='text-muted-foreground text-xs font-semibold'>
            STAFF
          </div>
          <ObjectView data={booking.staff} />
        </div>
        <div className='space-y-2'>
          <div className='text-muted-foreground text-xs font-semibold'>
            TABLE
          </div>
          <ObjectView data={booking.table} />
        </div>
        <div className='space-y-2'>
          <div className='text-muted-foreground text-xs font-semibold'>
            SERVICE
          </div>
          <ObjectView data={booking.service} />
        </div>
      </div>

      <div className='space-y-2'>
        <div className='text-muted-foreground text-xs font-semibold'>ITEMS</div>
        <ItemsView items={booking.items} />
      </div>

      {/* qolgan primitive fieldlarni ham ko‘rsatamiz */}
      <div className='bg-background grid gap-2 rounded-md border p-3 sm:grid-cols-2'>
        <KeyValue label='businessId' value={booking.businessId} />
        <KeyValue label='clientId' value={booking.clientId} />
        <KeyValue label='staffId' value={booking.staffId} />
        <KeyValue label='serviceId' value={booking.serviceId} />
        <KeyValue label='tableId' value={booking.tableId} />
        <KeyValue label='idempotencyKey' value={booking.idempotencyKey} />
        <KeyValue label='tasdiqlagan' value={confirmerSummary ?? '-'} />
        <KeyValue label='tasdiqlovchi turi' value={confirmerTypeLabel ?? '-'} />
        <KeyValue
          label='tasdiqlangan vaqti'
          value={booking.confirmedAt ? fmtDateTime(booking.confirmedAt) : '-'}
        />
        <KeyValue
          label='jarayon'
          value={<ProgressBadge status={booking.progressStatus} />}
        />
        <KeyValue
          label='tayyorlash muddati'
          value={
            booking.estimatedDurationMinutes
              ? `${booking.estimatedDurationMinutes} daqiqa`
              : '-'
          }
        />
        <KeyValue
          label='taxminiy tayyor vaqti'
          value={booking.estimatedReadyAt ? fmtDateTime(booking.estimatedReadyAt) : '-'}
        />
        <KeyValue
          label='delivery ready vaqti'
          value={
            booking.readyForDeliveryAt ? fmtDateTime(booking.readyForDeliveryAt) : '-'
          }
        />
        <KeyValue
          label='yetkazuvchi'
          value={
            booking.deliveryAssignedName
              ? `${booking.deliveryAssignedName} (${getResponsibleRoleLabel(booking.deliveryAssignedRole) || booking.deliveryAssignedRole || '-'})`
              : '-'
          }
        />
        <KeyValue
          label='yetkazilgan vaqti'
          value={booking.deliveredAt ? fmtDateTime(booking.deliveredAt) : '-'}
        />
        <KeyValue
          label='yetkazgan'
          value={
            booking.deliveredByName
              ? `${booking.deliveredByName} (${getResponsibleRoleLabel(booking.deliveredByRole) || booking.deliveredByRole || '-'})`
              : '-'
          }
        />
        <KeyValue
          label='ogohlantirish'
          value={
            booking.isDelayedPreparation
              ? 'Tayyorlash kechikdi'
              : booking.isDelayedDeliveryClaim
                ? 'Yetkazuvchi olinmagan'
                : '-'
          }
        />
        <KeyValue
          label='qolgan bo`limlar'
          value={booking.outstandingPreparationRoles?.length
            ? booking.outstandingPreparationRoles
                .map((role) => getResponsibleRoleLabel(role) || role)
                .join(', ')
            : '-'}
        />
        <KeyValue label='notes' value={booking.notes ?? '-'} />
      </div>

      {canAct && actions.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {actions.map((action) => (
            <Button
              key={action.status}
              type='button'
              variant='outline'
              size='sm'
              disabled={isUpdating}
              onClick={() => onStatusChange?.(booking.id, action.status)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function BookingTable({
  data,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canUpdateStatus,
  onStatusChange,
  isUpdating,
}: BookingTableProps) {
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({})

  const toggle = (id: string) => setOpenMap((p) => ({ ...p, [id]: !p[id] }))
  const currentPage = page ?? 1
  const pages = Math.max(totalPages ?? 1, 1)
  const currentSize = pageSize ?? 10

  return (
    <div className='rounded-md border'>
      {/* height berilsa vertical scroll ham bo‘ladi; hohlamasang olib tashla */}
      <ScrollArea className='w-full'>
        {/* IMPORTANT: table uchun min-width */}
        <div className='min-w-[1000px]'>
          <Table className='min-w-[1000px]'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[52px]'></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className='min-w-[1000px]'>
              {data?.map((booking) => {
                const isOpen = !!openMap[booking.id]
                const confirmerSummary = getBookingConfirmerSummary(booking)

                return (
                  <React.Fragment key={booking.id}>
                    {/* MAIN ROW */}
                    <TableRow className='align-top'>
                      <TableCell className='py-2'>
                        <Collapsible
                          open={isOpen}
                          onOpenChange={() => toggle(booking.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              aria-label='Expand'
                            >
                              {isOpen ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </TableCell>

                      <TableCell className='py-2'>
                        <div className='font-medium'>
                          {String(booking.id).slice(0, 8)}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {booking.id}
                        </div>
                      </TableCell>

                      <TableCell className='py-2'>
                        <div className='text-sm'>
                          {fmtDateTime(booking.createdAt)}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Updated: {fmtDateTime(booking.updatedAt)}
                        </div>
                      </TableCell>

                      <TableCell className='py-2'>
                        <div className='text-sm font-medium'>
                          {booking.client?.fullName ?? '-'}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {booking.client?.phoneNumber ?? '-'}
                        </div>
                      </TableCell>

                      <TableCell className='py-2'>
                        <div className='text-sm font-medium'>
                          #{booking.table?.tableNumber ?? '-'}
                          {booking.table?.tableColumns
                            ? ` (${booking.table.tableColumns})`
                            : ''}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {booking.tableId}
                        </div>
                      </TableCell>

                      <TableCell className='py-2'>
                        <div className='space-y-1'>
                          <StatusBadge status={booking.status} />
                          <ProgressBadge status={booking.progressStatus} />
                          {booking.isDelayedPreparation ? (
                            <div className='text-xs text-rose-300'>
                              Tayyorlash kechikdi
                            </div>
                          ) : null}
                          {booking.isDelayedDeliveryClaim ? (
                            <div className='text-xs text-rose-300'>
                              Yetkazuvchi olinmagan
                            </div>
                          ) : null}
                          {confirmerSummary ? (
                            <div className='text-muted-foreground text-xs'>
                              {confirmerSummary}
                            </div>
                          ) : null}
                          {booking.deliveryAssignedName ? (
                            <div className='text-muted-foreground text-xs'>
                              Yetkazuvchi: {booking.deliveryAssignedName}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className='py-2 text-right'>
                        <div className='text-lg font-bold'>
                          {money(booking.price)}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Items: {booking.items?.length ?? 0}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* EXPANDED CONTENT ROW */}
                    {isOpen ? (
                      <TableRow>
                        <TableCell colSpan={7} className='pt-0'>
                          <ExpandRow
                            booking={booking}
                            canUpdateStatus={canUpdateStatus}
                            onStatusChange={onStatusChange}
                            isUpdating={isUpdating}
                          />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* IMPORTANT: horizontal scrollbar */}
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <div className='bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
        <div className='flex items-center gap-2 text-sm'>
          <span className='text-muted-foreground'>Qatorlar:</span>
          <select
            className='bg-background h-9 rounded-md border px-2 text-sm'
            value={currentSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-3 text-sm'>
          <span className='text-muted-foreground'>
            {currentPage} / {pages}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Oldingi
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage >= pages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Keyingi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
