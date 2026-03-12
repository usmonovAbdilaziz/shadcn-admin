import dayjs from "dayjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  status: string;
  createdAt?: string;
  notes?: string;
  price?: string;

  client?: {
    fullName?: string;
    phoneNumber?: string;
  };

  service?: {
    name?: string;
    duration?: number;
    price?: number;
  };

  table?: {
    tableColumns?: string;
    tableNumber?: number;
  };

  items?: Array<{
    id: string;
    qty: number;
    priceSnapshot: number;
    note?: string | null;
    product?: {
      name?: string;
      price?: number;
    };
  }>;
};

const formatMoney = (value?: number | string) => {
  const num = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("uz-UZ").format(Number.isFinite(num) ? num : 0);
};

const getStatusMeta = (status?: string) => {
  const normalized = (status || "UNKNOWN").toUpperCase();
  const labelMap: Record<string, string> = {
    PENDING: "Kutilmoqda",
    CONFIRMED: "Tasdiqlangan",
    CANCELLED: "Bekor qilingan",
    COMPLETED: "Yakunlangan",
  };

  const classMap: Record<string, string> = {
    PENDING: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    CONFIRMED: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    CANCELLED: "border-rose-400/40 bg-rose-500/10 text-rose-200",
    COMPLETED: "border-sky-400/40 bg-sky-500/10 text-sky-200",
  };

  return {
    label: labelMap[normalized] || normalized,
    className:
      classMap[normalized] || "border-slate-400/40 bg-slate-500/10 text-slate-200",
  };
};

export function BookingList({
  bookings,
  canUpdateStatus,
  onStatusChange,
  isUpdating,
}: {
  bookings: Booking[];
  canUpdateStatus?: boolean;
  onStatusChange?: (id: string, status: string) => void | Promise<void>;
  isUpdating?: boolean;
}) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {bookings.map((b) => {
        const itemsTotal =
          b.items?.reduce(
            (sum, item) => sum + item.priceSnapshot * item.qty,
            0,
          ) ?? 0;
        const total = b.price ?? itemsTotal ?? b.service?.price ?? 0;
        const statusMeta = getStatusMeta(b.status);

        const status = String(b.status || "").toUpperCase();
        const canAct = Boolean(canUpdateStatus && onStatusChange);

        const actions: Array<{ label: string; status: string }> = [];
        if (status === "PENDING") {
          actions.push({ label: "Tasdiqlash", status: "CONFIRMED" });
          actions.push({ label: "Bekor qilish", status: "CANCELLED" });
        } else if (status === "CONFIRMED") {
          actions.push({ label: "Yakunlash", status: "COMPLETED" });
          actions.push({ label: "Bekor qilish", status: "CANCELLED" });
        }

        return (
          <AccordionItem key={b.id} value={b.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full items-center justify-between gap-4 text-left">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold">
                    {b.client?.fullName || "Unknown client"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {b.client?.phoneNumber || "-"} · Stol{" "}
                    {b.table?.tableColumns || "-"}-{b.table?.tableNumber ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      statusMeta.className,
                    )}
                  >
                    {statusMeta.label}
                  </span>
                  <span className="text-base font-semibold">
                    {formatMoney(total)} so'm
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="grid gap-4 text-sm md:grid-cols-[1.2fr_1fr]">
                <div className="space-y-3">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="text-xs text-muted-foreground">Buyurtma ID</div>
                    <div className="break-all font-mono text-xs">{b.id}</div>
                  </div>

                  <div className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mijoz</span>
                      <span className="font-medium">
                        {b.client?.fullName || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Telefon</span>
                      <span className="font-medium">
                        {b.client?.phoneNumber || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Stol</span>
                      <span className="font-medium">
                        {b.table?.tableColumns || "-"}-{b.table?.tableNumber ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Vaqt</span>
                      <span className="font-medium">
                        {b.createdAt
                          ? dayjs(b.createdAt).format("YYYY-MM-DD HH:mm")
                          : "-"}
                      </span>
                    </div>
                  </div>

                  {b.notes ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div className="text-xs text-muted-foreground">Izoh</div>
                      <div className="mt-1 text-sm">{b.notes}</div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="mb-2 text-xs text-muted-foreground">Itemlar</div>
                  <div className="space-y-2">
                    {(b.items || []).map((item) => {
                      const itemTotal = item.priceSnapshot * item.qty;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {item.product?.name || "Noma'lum"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.qty} x {formatMoney(item.priceSnapshot)} so'm
                              {item.note ? ` · ${item.note}` : ""}
                            </div>
                          </div>
                          <div className="shrink-0 font-semibold">
                            {formatMoney(itemTotal)} so'm
                          </div>
                        </div>
                      );
                    })}
                    {(b.items || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground">Itemlar yo'q</div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                    <span className="text-xs text-muted-foreground">Jami</span>
                    <span className="text-base font-semibold">
                      {formatMoney(total)} so'm
                    </span>
                  </div>

                  {canAct && actions.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onStatusChange?.(b.id, action.status)}
                          className="rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-60"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
