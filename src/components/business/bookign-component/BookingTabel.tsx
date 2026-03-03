import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from "lucide-react"

type Booking = any

const statusLabel = (s: string) =>
  s === "CONFIRMED"
    ? "Tasdiqlangan"
    : s === "PENDING"
      ? "Kutilmoqda"
      : s === "CANCELLED"
        ? "Bekor qilingan"
        : s === "COMPLETED"
          ? "Yakunlangan"
          : s

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "CONFIRMED"
  const isPending = status === "PENDING"
  const isCancelled = status === "CANCELLED"
  const isCompleted = status === "COMPLETED"

  return (
    <Badge
      variant={isConfirmed ? "default" : "secondary"}
      className={[
        isConfirmed ? "bg-emerald-500 hover:bg-emerald-600" : "",
        isPending ? "bg-amber-500 hover:bg-amber-600 text-white" : "",
        isCancelled ? "bg-rose-500 hover:bg-rose-600 text-white" : "",
        isCompleted ? "bg-sky-500 hover:bg-sky-600 text-white" : "",
      ].join(" ")}
    >
      {statusLabel(status)}
    </Badge>
  )
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

function money(v: any) {
  const n = Number(v ?? 0)
  return `${n.toLocaleString("uz-UZ")} so'm`
}

function KeyValue({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function ObjectView({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data || {})
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <KeyValue
          key={k}
          label={k}
          value={typeof v === "object" ? JSON.stringify(v) : String(v)}
        />
      ))}
    </div>
  )
}

function ItemsView({ items }: { items: any[] }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">Items yo‘q</div>

  const total = items.reduce(
    (sum, it) => sum + Number(it.priceSnapshot ?? 0) * Number(it.qty ?? 0),
    0
  )

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service/Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Sum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => {
              const name = it?.service?.name || it?.product?.name || it.productId || it.serviceId
              const qty = Number(it.qty ?? 0)
              const price = Number(it.priceSnapshot ?? it.price ?? 0)
              return (
                <TableRow key={it.id ?? `${name}-${qty}-${price}`}>
                  <TableCell>
                    <div className="font-medium">{name}</div>
                    {it.note ? (
                      <div className="text-xs text-muted-foreground">Izoh: {it.note}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{qty}</TableCell>
                  <TableCell className="text-right">{money(price)}</TableCell>
                  <TableCell className="text-right">{money(price * qty)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="text-sm">
          <span className="text-muted-foreground mr-2">Items total:</span>
          <span className="text-lg font-bold">{money(total)}</span>
        </div>
      </div>
    </div>
  )
}

function ExpandRow({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-4 rounded-md border bg-muted/20 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">CLIENT</div>
          <ObjectView data={booking.client} />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">STAFF</div>
          <ObjectView data={booking.staff} />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">TABLE</div>
          <ObjectView data={booking.table} />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">SERVICE</div>
          <ObjectView data={booking.service} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">ITEMS</div>
        <ItemsView items={booking.items} />
      </div>

      {/* qolgan primitive fieldlarni ham ko‘rsatamiz */}
      <div className="grid gap-2 rounded-md border bg-background p-3 sm:grid-cols-2">
        <KeyValue label="businessId" value={booking.businessId} />
        <KeyValue label="clientId" value={booking.clientId} />
        <KeyValue label="staffId" value={booking.staffId} />
        <KeyValue label="serviceId" value={booking.serviceId} />
        <KeyValue label="tableId" value={booking.tableId} />
        <KeyValue label="idempotencyKey" value={booking.idempotencyKey} />
        <KeyValue label="notes" value={booking.notes ?? "-"} />
      </div>
    </div>
  )
}

export function BookingTable({ data }: { data: Booking[] }) {
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setOpenMap((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="rounded-md border">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[52px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((booking) => {
              const isOpen = !!openMap[booking.id]
              return (
                <React.Fragment key={booking.id}>
                  {/* MAIN ROW */}
                  <TableRow className="align-top">
                    <TableCell className="py-2">
                      <Collapsible open={isOpen} onOpenChange={() => toggle(booking.id)}>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Expand"
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="font-medium">{String(booking.id).slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{booking.id}</div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="text-sm">{fmtDateTime(booking.createdAt)}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {fmtDateTime(booking.updatedAt)}
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="text-sm font-medium">
                        {booking.client?.fullName ?? "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.client?.phoneNumber ?? "-"}
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="text-sm font-medium">
                        #{booking.table?.tableNumber ?? "-"}
                        {booking.table?.tableColumns ? ` (${booking.table.tableColumns})` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.tableId}
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <StatusBadge status={booking.status} />
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <div className="text-lg font-bold">{money(booking.price)}</div>
                      <div className="text-xs text-muted-foreground">
                        Items: {booking.items?.length ?? 0}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* EXPANDED CONTENT ROW */}
                  {isOpen ? (
                    <TableRow>
                      <TableCell colSpan={7} className="pt-0">
                        <ExpandRow booking={booking} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}