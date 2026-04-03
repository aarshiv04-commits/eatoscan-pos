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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TableStatus } from "../backend.d";
import { formatPrice } from "../data/mockData";
import {
  useGetAllTables,
  useGetBillForTable,
  useMarkOrderAsPaid,
} from "../hooks/useQueries";

function BillModal({
  tableId,
  tableName,
  onClose,
}: {
  tableId: bigint;
  tableName: string;
  onClose: () => void;
}) {
  const { data: bill, isLoading } = useGetBillForTable(tableId);
  const markPaid = useMarkOrderAsPaid();

  const handlePay = async () => {
    if (!bill) return;
    try {
      await markPaid.mutateAsync(bill.order.id);
      toast.success(`Bill for ${tableName} marked as paid!`);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to process payment");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent data-ocid="billing.bill.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bill for {tableName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3" data-ocid="billing.bill.loading_state">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-8" />
            ))}
          </div>
        ) : !bill ? (
          <div
            className="py-8 text-center"
            data-ocid="billing.bill.empty_state"
          >
            <p className="text-muted-foreground">
              No active bill for this table.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {bill.order.items.map((item) => (
                <div
                  key={item.menuItemId.toString()}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ×{item.quantity.toString()}
                    </span>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (5%)</span>
                <span>{formatPrice(bill.tax)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-gold">{formatPrice(bill.grandTotal)}</span>
            </div>
            {bill.order.notes && (
              <p className="text-sm text-muted-foreground italic">
                "{bill.order.notes}"
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="billing.bill.cancel_button"
          >
            Close
          </Button>
          {bill && (
            <Button
              onClick={handlePay}
              disabled={markPaid.isPending}
              className="bg-success-light text-success hover:bg-success-light/80"
              data-ocid="billing.bill.pay_button"
            >
              {markPaid.isPending ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <CheckCircle size={14} className="mr-2" />
              )}
              Mark as Paid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Billing() {
  const { data: tables = [], isLoading } = useGetAllTables();
  const [selectedTableId, setSelectedTableId] = useState<bigint | null>(null);

  const occupiedTables = tables.filter(
    (t) => t.status === TableStatus.occupied,
  );
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} className="text-gold" />
          Billing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {occupiedTables.length} occupied tables with active bills
        </p>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="billing.loading_state"
        >
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="h-36" />
          ))}
        </div>
      ) : occupiedTables.length === 0 ? (
        <div
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
          data-ocid="billing.empty_state"
        >
          <CreditCard
            size={48}
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-muted-foreground">
            No occupied tables. Guests will appear here when seated.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          data-ocid="billing.tables.list"
        >
          {occupiedTables.map((table, idx) => (
            <motion.div
              key={table.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                data-ocid={`billing.table.item.${idx + 1}`}
                className="shadow-card border-border hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-0.5 bg-[oklch(0.96_0.04_70)] border-[oklch(0.88_0.05_70)]"
                onClick={() => setSelectedTableId(table.id)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[16px]">{table.name}</CardTitle>
                  <p className="text-muted-foreground text-[12px]">
                    {table.capacity.toString()} seats &bull; Occupied
                  </p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {table.currentOrderId && (
                    <p className="text-[12px] text-muted-foreground mb-3">
                      Order #{table.currentOrderId.toString()}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    data-ocid={`billing.table.pay_button.${idx + 1}`}
                  >
                    <CreditCard size={12} className="mr-1.5" />
                    View Bill
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTableId && selectedTable && (
        <BillModal
          tableId={selectedTableId}
          tableName={selectedTable.name}
          onClose={() => setSelectedTableId(null)}
        />
      )}
    </div>
  );
}
