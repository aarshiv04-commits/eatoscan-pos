import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChefHat, Clock, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { type Order, OrderStatus } from "../backend.d";
import { formatPrice, getElapsedMinutes } from "../data/mockData";
import {
  useGetAllOrders,
  useGetAllTables,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const ACTIVE_STATUSES = [
  OrderStatus.pending,
  OrderStatus.preparing,
  OrderStatus.ready,
];

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.pending]: "bg-warning-light text-warning border-0",
  [OrderStatus.preparing]:
    "bg-[oklch(0.93_0.07_60)] text-[oklch(0.40_0.12_60)] border-0",
  [OrderStatus.ready]: "bg-success-light text-success border-0",
};

const CARD_BORDER: Record<string, string> = {
  [OrderStatus.pending]: "border-l-4 border-l-[oklch(0.72_0.12_65)]",
  [OrderStatus.preparing]: "border-l-4 border-l-[oklch(0.68_0.15_60)]",
  [OrderStatus.ready]: "border-l-4 border-l-[oklch(0.55_0.14_145)]",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.pending]: OrderStatus.preparing,
  [OrderStatus.preparing]: OrderStatus.ready,
  [OrderStatus.ready]: OrderStatus.served,
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.pending]: "Start Preparing",
  [OrderStatus.preparing]: "Mark as Ready",
  [OrderStatus.ready]: "Mark as Served",
};

export default function Kitchen() {
  const { data: orders = [], isLoading, refetch } = useGetAllOrders();
  const { data: tables = [] } = useGetAllTables();
  const updateStatus = useUpdateOrderStatus();
  const qc = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["orders", "all"] });
    }, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [qc]);

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status as OrderStatus),
  );
  const pending = activeOrders.filter((o) => o.status === OrderStatus.pending);
  const preparing = activeOrders.filter(
    (o) => o.status === OrderStatus.preparing,
  );
  const ready = activeOrders.filter((o) => o.status === OrderStatus.ready);

  const handleAdvance = async (order: Order) => {
    const next = NEXT_STATUS[order.status as OrderStatus];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: next });
      toast.success(`Order #${order.id} → ${next}`);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const KitchenCard = ({ order, idx }: { order: Order; idx: number }) => {
    const table = tables.find((t) => t.id === order.tableId);
    const elapsed = getElapsedMinutes(order.createdAt);
    const nextLabel = NEXT_LABEL[order.status as OrderStatus];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <Card
          data-ocid={`kitchen.order.item.${idx + 1}`}
          className={`shadow-card ${CARD_BORDER[order.status] || ""}`}
        >
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-[15px] font-bold">
                  Order #{order.id.toString()}
                </CardTitle>
                <p className="text-muted-foreground text-[12px] mt-0.5">
                  {table?.name || `Table ${order.tableId}`}
                </p>
              </div>
              <Badge
                className={`text-[11px] capitalize ${STATUS_COLORS[order.status] || ""}`}
              >
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <div
                  key={item.menuItemId.toString()}
                  className="flex justify-between text-[13px]"
                >
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">
                    ×{item.quantity.toString()}
                  </span>
                </div>
              ))}
            </div>
            {order.notes && (
              <p className="text-[11px] text-muted-foreground italic mb-3 border-l-2 border-accent pl-2">
                {order.notes}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock size={12} />
                <span
                  className={
                    elapsed > 20 ? "text-destructive font-semibold" : ""
                  }
                >
                  {elapsed} min
                </span>
              </div>
              <p className="font-semibold text-[13px]">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            {nextLabel && (
              <Button
                size="sm"
                className="w-full mt-3 h-8 text-xs"
                onClick={() => handleAdvance(order)}
                disabled={updateStatus.isPending}
                data-ocid={`kitchen.advance.button.${idx + 1}`}
              >
                {nextLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat size={28} className="text-gold" />
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-muted-foreground text-sm">
              {activeOrders.length} active orders &bull; Auto-refreshes every
              30s
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          data-ocid="kitchen.refresh.button"
        >
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-3 gap-4"
          data-ocid="kitchen.loading_state"
        >
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="h-44" />
          ))}
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="text-center py-16" data-ocid="kitchen.empty_state">
          <CheckCircle2 size={48} className="mx-auto text-success mb-3" />
          <p className="text-muted-foreground text-lg font-medium">
            All caught up! No active orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <h2 className="font-semibold text-[15px]">Pending</h2>
              <Badge className="bg-warning-light text-warning border-0 text-[11px]">
                {pending.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {pending.map((o, i) => (
                <KitchenCard key={o.id.toString()} order={o} idx={i} />
              ))}
              {pending.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">
                    No pending orders
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.72_0.15_60)]" />
              <h2 className="font-semibold text-[15px]">Preparing</h2>
              <Badge className="bg-[oklch(0.93_0.07_60)] text-[oklch(0.40_0.12_60)] border-0 text-[11px]">
                {preparing.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {preparing.map((o, i) => (
                <KitchenCard key={o.id.toString()} order={o} idx={i} />
              ))}
              {preparing.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">
                    Nothing preparing
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.55_0.14_145)]" />
              <h2 className="font-semibold text-[15px]">Ready</h2>
              <Badge className="bg-success-light text-success border-0 text-[11px]">
                {ready.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {ready.map((o, i) => (
                <KitchenCard key={o.id.toString()} order={o} idx={i} />
              ))}
              {ready.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">
                    Nothing ready yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
