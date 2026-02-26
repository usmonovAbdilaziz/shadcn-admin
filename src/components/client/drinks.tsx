import {
  Timer,
  User,
  Plus,
  Minus,
  CheckCircle2,
  ThermometerSun,
  Snowflake,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useMemo, useState } from "react";
import { TeaOptionsModal } from "./tea-options-modal";
import { useCartStore } from "@/store/use-cart-store";

export const Drinks = ({
  services,
}: any) => {
  const [type, setType] = useState<"HOT" | "COLD">("HOT");
  const [selectedTea, setSelectedTea] = useState<any>(null);

  const { items: cartItems, updateQty, addToCart } = useCartStore();

  const servicesDrinksData = useMemo(() => {
    return (
      services?.data?.filter(
        (service: any) =>
          service?.isActive === true &&
          service?.category === "DRINKS" &&
          String(service?.type || "").toUpperCase() === type
      ) ?? []
    );
  }, [services?.data, type]);

  return (
    <Card className="w-full overflow-hidden border-border/60 bg-gradient-to-b from-background to-muted/20 p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drinks</h1>
        </div>

        {/* Segmented buttons */}
        <div className="inline-flex rounded-xl border bg-background/60 p-1 shadow-sm backdrop-blur">
          <Button
            size="sm"
            variant={type === "HOT" ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              type === "HOT" ? "shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setType("HOT")}
          >
            <ThermometerSun className="mr-2 h-4 w-4" />
            Hot
          </Button>
          <Button
            size="sm"
            variant={type === "COLD" ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              type === "COLD" ? "shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setType("COLD")}
          >
            <Snowflake className="mr-2 h-4 w-4" />
            Cold
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servicesDrinksData.map((service: any) => {
          const hasLiters = Array.isArray(service?.liters) && service.liters.length > 0;

const totalCount = cartItems
  .filter((item) => item.serviceId === service.id)
  .reduce((sum, item) => sum + item.qty, 0);

const isSelected = totalCount > 0;

const totalPrice = cartItems
  .filter((item) => item.serviceId === service.id)
  .reduce((sum, item) => sum + item.priceSnapshot * item.qty, 0);

          return (
            <Card
               key={service.id}
               className={cn(
                "group relative w-[280px] overflow-hidden border transition-all duration-300",
                // DEFAULT (tanlanmagan): oddiy border, oddiy shadow
                !isSelected && "border-border/60 shadow-sm",
                // HOVER (tanlanmagan): juda yengil
                !isSelected && "hover:border-border hover:shadow-md",
                // SELECTED: aniq ko‘rinsin
                isSelected && "border-primary/50 shadow-lg"
              )}
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <img
                  src={service.photoUrl}
                  alt={service.name}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badges */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <Badge className="bg-background/70 text-foreground backdrop-blur">
                    <Timer className="mr-1 h-3 w-3" /> {service.duration} min
                  </Badge>
                  <Badge variant="secondary" className="bg-background/70 backdrop-blur">
                    {type}
                  </Badge>
                </div>

                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-background/70 p-1.5 backdrop-blur">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold tracking-tight">
                      {service.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground italic">
                      {service.description}
                    </p>
                  </div>

                  {/* Price hint */}
                  {!hasLiters ? (
                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold">
                        {Number(service.price).toLocaleString()}{" "}
                        <span className="text-xs font-medium text-muted-foreground">
                          so&apos;m
                        </span>
                      </div>
                      {totalCount > 1 && (
                        <div className="text-xs text-muted-foreground">
                          Jami: {totalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">1L</div>
                      <div className="text-sm font-semibold">
                        {Number(service.price).toLocaleString()} so&apos;m
                      </div>
                    </div>
                  )}
                </div>

                {service?.staff?.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span className="truncate">
                      Hodim: {service.staff[0]?.fullName}
                    </span>
                  </div>
                )}

                {/* Liters selector */}
                {hasLiters ? (
                  <div className="px-3 pt-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Litr tanlang</span>
                      <span>{service.liters.join(", ")}</span>
                    </div>

                    {/* SCROLL CONTAINER */}
                    <div className="max-h-[130px] overflow-y-auto pr-1 space-y-2">
                      {service.liters.map((liter: string) => {
                        const item = cartItems.find(i => i.serviceId === service.id && i.options.liter === liter)
                        const literQty = item?.qty || 0
                        const isLiterActive = literQty > 0

                        return (
                          <div
                            key={liter}
                            className={cn(
                              "flex items-center justify-between rounded-xl border px-3 py-2 transition-colors",
                              isLiterActive
                                ? "border-primary/40 bg-primary/10"
                                : "border-border/60 bg-muted/10"
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                isLiterActive ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {liter} L{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                ({(service.price * parseFloat(liter)).toLocaleString()} so'm)
                              </span>
                            </span>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => {
                                   if (item) updateQty(item.id, -1)
                                }}
                                disabled={!isLiterActive}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>

                              <span className="w-5 text-center text-sm font-bold tabular-nums">
                                {literQty}
                              </span>

                              <Button
                                variant={isLiterActive ? "default" : "outline"}
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => addToCart(service, { liter })}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {isSelected && (
                      <div className="mt-2 rounded-xl border border-border/60 bg-muted/10 p-3">
                        {/* breakdown rows for liters */}
                        {cartItems
                          .filter(i => i.serviceId === service.id && i.options.liter)
                          .map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{item.options.liter}L × {item.qty} ta</span>
                            <span className="font-semibold">
                              {(item.priceSnapshot * item.qty).toLocaleString()} so'm
                            </span>
                          </div>
                        ))}

                        <div className="mt-2 flex items-center justify-between border-t pt-2">
                          <span className="text-sm font-semibold">Jami</span>
                          <span className="text-lg font-extrabold">
                            {totalPrice.toLocaleString()} <span className="text-xs text-muted-foreground">so'm</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Non-liter item counter
                  <div className="flex items-center justify-between rounded-xl border bg-muted/10 p-3">
                    <div className="text-sm text-muted-foreground">
                      Soni
                    </div>
                    <div className="flex items-center gap-2">
                       {/* If it's tea, we want to open modal for adding new variants, but maybe just +/- for simple ones? */}
                       {/* The user wants "Add to cart" modal for Tea. */}
                       {service.name.toLowerCase().includes("choy") || service.name.toLowerCase().includes("tea") ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full gap-1"
                            onClick={() => setSelectedTea(service)}
                          >
                            <Plus className="h-4 w-4" /> Tanlash
                          </Button>
                       ) : (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                               const item = cartItems.find(i => i.serviceId === service.id);
                               if (item) updateQty(item.id, -1);
                            }}
                            disabled={!isSelected}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <div className="w-7 text-center text-sm font-bold tabular-nums">
                            {totalCount}
                          </div>

                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => addToCart(service, {})}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                       )}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtle glow */}
              <div className="pointer-events-none absolute -inset-x-10 -bottom-12 h-24 bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          );
        })}
      </div>

      <TeaOptionsModal 
        isOpen={!!selectedTea} 
        onClose={() => setSelectedTea(null)} 
        service={selectedTea}
      />
    </Card>
  );
};