import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Filter,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Order, type OrderItem, OrderStatus } from "../backend.d";
import { formatPrice, getElapsedMinutes } from "../data/mockData";
import {
  useCreateOrder,
  useGetAllCategories,
  useGetAllMenuItems,
  useGetAllOrders,
  useGetAllTables,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: OrderStatus.pending },
  { label: "Preparing", value: OrderStatus.preparing },
  { label: "Ready", value: OrderStatus.ready },
  { label: "Served", value: OrderStatus.served },
  { label: "Completed", value: OrderStatus.completed },
  { label: "Cancelled", value: OrderStatus.cancelled },
];

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.pending]: OrderStatus.preparing,
  [OrderStatus.preparing]: OrderStatus.ready,
  [OrderStatus.ready]: OrderStatus.served,
  [OrderStatus.served]: OrderStatus.completed,
};

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.pending]: "bg-warning-light text-warning border-0",
  [OrderStatus.preparing]: "bg-warning-light text-warning border-0",
  [OrderStatus.ready]: "bg-success-light text-success border-0",
  [OrderStatus.served]: "bg-success-light text-success border-0",
  [OrderStatus.completed]: "bg-secondary text-muted-foreground border-0",
  [OrderStatus.cancelled]: "bg-destructive/10 text-destructive border-0",
};

interface CartItem extends OrderItem {
  itemName: string;
}

export default function Orders() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const { data: tables = [] } = useGetAllTables();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const { data: categories = [] } = useGetAllCategories();
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter,
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  const addToCart = (menuItemId: bigint, name: string, price: bigint) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: i.quantity + BigInt(1) }
            : i,
        );
      }
      return [
        ...prev,
        {
          menuItemId,
          name,
          notes: "",
          quantity: BigInt(1),
          price,
          itemName: name,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: bigint) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing && existing.quantity > BigInt(1)) {
        return prev.map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: i.quantity - BigInt(1) }
            : i,
        );
      }
      return prev.filter((i) => i.menuItemId !== menuItemId);
    });
  };

  const handleCreateOrder = async () => {
    if (!selectedTableId) {
      toast.error("Please select a table");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add items to the order");
      return;
    }
    const items: OrderItem[] = cart.map((c) => ({
      menuItemId: c.menuItemId,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
      notes: c.notes,
    }));
    try {
      await createOrder.mutateAsync({
        tableId: BigInt(selectedTableId),
        items,
        notes: orderNotes,
      });
      toast.success("Order created successfully");
      setNewOrderOpen(false);
      setCart([]);
      setSelectedTableId("");
      setOrderNotes("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create order");
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: next });
      toast.success(`Order #${order.id} → ${next}`);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const filteredMenuItems = selectedCatId
    ? menuItems.filter(
        (i) => i.categoryId.toString() === selectedCatId && i.isAvailable,
      )
    : menuItems.filter((i) => i.isAvailable);

  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
  );

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {orders.length} total orders
          </p>
        </div>
        <Button
          onClick={() => setNewOrderOpen(true)}
          data-ocid="orders.new_order.button"
        >
          <Plus size={16} className="mr-2" /> New Order
        </Button>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex items-center gap-2 mb-6 flex-wrap"
        data-ocid="orders.status.tab"
      >
        {STATUS_FILTERS.map((f) => (
          <button
            type="button"
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            data-ocid={`orders.filter.${f.value}.tab`}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-70">
                ({orders.filter((o) => o.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="orders.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-24" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
          data-ocid="orders.empty_state"
        >
          <ShoppingBag
            size={40}
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-muted-foreground">No orders with this status</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="orders.list">
          <AnimatePresence>
            {filteredOrders.map((order, idx) => {
              const table = tables.find((t) => t.id === order.tableId);
              const elapsed = getElapsedMinutes(order.createdAt);
              const nextStatus = STATUS_NEXT[order.status];
              return (
                <motion.div
                  key={order.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    data-ocid={`orders.item.${idx + 1}`}
                    className="shadow-card border-border hover:shadow-card-hover transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-[15px]">
                              Order #{order.id.toString()}
                            </p>
                            <Badge
                              className={`text-[11px] capitalize ${STATUS_COLORS[order.status] || ""}`}
                            >
                              {order.status}
                            </Badge>
                            <span className="text-muted-foreground text-[12px]">
                              {elapsed} min ago
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[13px]">
                            {table?.name || `Table ${order.tableId}`} &bull;{" "}
                            {order.items.length} items
                          </p>
                          {order.notes && (
                            <p className="text-[12px] text-muted-foreground italic mt-1">
                              "{order.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="font-bold text-[16px]">
                            {formatPrice(order.totalAmount)}
                          </p>
                          {nextStatus && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStatus(order);
                              }}
                              data-ocid={`orders.advance_status.button.${idx + 1}`}
                            >
                              Mark as {nextStatus}
                              <ChevronRight size={13} className="ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent data-ocid="orders.detail.dialog">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id.toString()}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`capitalize ${STATUS_COLORS[selectedOrder.status] || ""}`}
                  >
                    {selectedOrder.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tables.find((t) => t.id === selectedOrder.tableId)?.name}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.menuItemId.toString()}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.name} &times; {item.quantity.toString()}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                {selectedOrder.notes && (
                  <p className="text-sm text-muted-foreground italic">
                    Note: {selectedOrder.notes}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  data-ocid="orders.detail.close_button"
                >
                  Close
                </Button>
                {STATUS_NEXT[selectedOrder.status] && (
                  <Button
                    onClick={() => {
                      handleAdvanceStatus(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    data-ocid="orders.detail.advance_button"
                  >
                    Mark as {STATUS_NEXT[selectedOrder.status]}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Order Modal */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent
          className="max-w-2xl"
          data-ocid="orders.new_order.dialog"
        >
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-2">
            {/* Menu selector */}
            <div className="space-y-3">
              <div>
                <Label className="mb-2 block">Filter by Category</Label>
                <Select value={selectedCatId} onValueChange={setSelectedCatId}>
                  <SelectTrigger
                    className="h-8 text-sm"
                    data-ocid="orders.new_order.category.select"
                  >
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {sortedCategories.map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => (
                  <button
                    type="button"
                    key={item.id.toString()}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-secondary/60 cursor-pointer transition-colors text-left"
                    onClick={() => addToCart(item.id, item.name, item.price)}
                  >
                    <div>
                      <p className="text-[13px] font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Plus size={14} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Table *</Label>
                <Select
                  value={selectedTableId}
                  onValueChange={setSelectedTableId}
                >
                  <SelectTrigger data-ocid="orders.new_order.table.select">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t.id.toString()} value={t.id.toString()}>
                        {t.name} ({t.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-border rounded-xl p-3 min-h-[140px] max-h-[200px] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center mt-8">
                    No items added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId.toString()}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[13px]">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[13px] w-4 text-center">
                            {item.quantity.toString()}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              addToCart(item.menuItemId, item.name, item.price)
                            }
                            className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70"
                          >
                            <Plus size={10} />
                          </button>
                          <span className="text-[12px] text-muted-foreground w-16 text-right">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="flex justify-between font-semibold text-sm border-t border-border pt-2">
                  <span>Total</span>
                  <span>{formatPrice(BigInt(cartTotal))}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Special instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  data-ocid="orders.new_order.notes.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewOrderOpen(false)}
              data-ocid="orders.new_order.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={createOrder.isPending}
              data-ocid="orders.new_order.submit_button"
            >
              {createOrder.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
