import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  ClipboardList,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Tag,
} from "lucide-react"

type Business = {
  id: string
  businessName?: string
  businessType?: string
  city?: string
  phone?: string
  address?: string
  isApproved?: boolean
}

export type ServiceItem = {
  id: string
  businessId: string
  name?: string
  description?: string
  category?: string
  type?: string
  duration?: number
  price?: number
  photoUrl?: string | null
  color?: string | null
  liters?: any[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  business?: Business
}

function formatPrice(v?: number) {
  if (v === null || v === undefined) return "—"
  return new Intl.NumberFormat("uz-UZ").format(v) + " so'm"
}

export function ServiceDetailsModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  data: ServiceItem | null
}) {
  const canOpen = open && !!data
  const url = "http://localhost:3002"
  if (!data) return null

  return (
    <Dialog open={canOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden rounded-2xl p-0">
        {/* Premium header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Service details
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {data.business?.businessName ?? "Business"} • {data.category ?? "—"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-wrap gap-2">
            {data.type ? <Badge variant="secondary">{data.type}</Badge> : null}
            {data.isActive ? (
              <Badge className="bg-green-500 text-white shadow-lg shadow-green-500/20">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
            {data.duration !== undefined ? (
              <Badge variant="outline" className="border-white/30 text-white">{data.duration} min</Badge>
            ) : null}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Top section: image + short info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="aspect-square w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
                <img
                  src={url + data.photoUrl || ""}
                  alt={data.name ?? "Service image"}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
                {!data.photoUrl ? (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    No photo
                  </div>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{data.name ?? "—"}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</p>
                <p className="text-sm leading-relaxed">{data.description ?? "—"}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">{formatPrice(data.price)}</Badge>
                {data.color ? <Badge variant="outline">{data.color}</Badge> : null}
              </div>
            </div>
          </div>

          <Separator />

          {/* ===== Details & Business Info — SIDE BY SIDE ===== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Details table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20">
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-base font-semibold">Details</h4>
              </div>

              <div className="rounded-xl border shadow-sm">
                <Table>
                  <TableBody>
                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="w-36 text-muted-foreground text-sm">
                        Service ID
                      </TableCell>
                      <TableCell className="font-medium text-sm font-mono">{data.id}</TableCell>
                    </TableRow>

                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">Business</TableCell>
                      <TableCell className="font-medium text-sm">
                        {data.business?.businessName ?? "—"}
                      </TableCell>
                    </TableRow>

                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">Category</TableCell>
                      <TableCell className="font-medium text-sm">{data.category ?? "—"}</TableCell>
                    </TableRow>

                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">Type</TableCell>
                      <TableCell className="font-medium text-sm">{data.type ?? "—"}</TableCell>
                    </TableRow>

                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">Duration</TableCell>
                      <TableCell className="font-medium text-sm">
                        {data.duration !== undefined ? `${data.duration} min` : "—"}
                      </TableCell>
                    </TableRow>

                    <TableRow className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm">Price</TableCell>
                      <TableCell className="font-medium text-sm text-green-600 dark:text-green-400">{formatPrice(data.price)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Business info table */}
            {data.business ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-base font-semibold">Business info</h4>
                </div>

                <div className="rounded-xl border shadow-sm">
                  <Table>
                    <TableBody>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="w-36 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5" />
                            Name
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {data.business.businessName ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" />
                            Type
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm capitalize">
                          {data.business.businessType ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            City
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{data.business.city ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            Phone
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{data.business.phone ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Address
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{data.business.address ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Approved
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {data.business.isApproved ? (
                            <Badge className="bg-green-500 text-white shadow-sm">Approved</Badge>
                          ) : (
                            <Badge variant="destructive">Not approved</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


