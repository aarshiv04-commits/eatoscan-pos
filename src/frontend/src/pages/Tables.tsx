import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Plus, QrCode, ScanLine, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type RestaurantTable, TableStatus } from "../backend.d";
import {
  useCreateTable,
  useDeleteTable,
  useGetAllTables,
  useUpdateTable,
  useUpdateTableStatus,
} from "../hooks/useQueries";
import { useQRScanner } from "../qr-code/useQRScanner";

const tableStatusColor: Record<string, string> = {
  [TableStatus.occupied]:
    "bg-[oklch(0.96_0.04_70)] border-[oklch(0.88_0.05_70)]",
  [TableStatus.available]:
    "bg-[oklch(0.95_0.04_145)] border-[oklch(0.87_0.05_145)]",
  [TableStatus.reserved]: "bg-secondary border-border",
};

const statusBadgeClass: Record<string, string> = {
  [TableStatus.occupied]: "bg-warning-light text-warning border-0",
  [TableStatus.available]: "bg-success-light text-success border-0",
  [TableStatus.reserved]: "bg-secondary text-muted-foreground border-0",
};

interface TableFormData {
  name: string;
  capacity: string;
  qrCode: string;
}

export default function Tables() {
  const { data: tables = [], isLoading } = useGetAllTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const updateStatus = useUpdateTableStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null,
  );
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [formData, setFormData] = useState<TableFormData>({
    name: "",
    capacity: "4",
    qrCode: "",
  });

  const qrScanner = useQRScanner({
    facingMode: "environment",
    maxResults: 1,
  });

  const openCreate = () => {
    setEditingTable(null);
    setFormData({ name: "", capacity: "4", qrCode: "" });
    setIsFormOpen(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity.toString(),
      qrCode: table.qrCode,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Table name is required");
      return;
    }
    const input = {
      name: formData.name.trim(),
      capacity: BigInt(Number(formData.capacity) || 4),
      qrCode:
        formData.qrCode.trim() ||
        `QR-${formData.name.toUpperCase().replace(/\s+/g, "")}`,
    };
    try {
      if (editingTable) {
        await updateTable.mutateAsync({ id: editingTable.id, input });
        toast.success(`Table "${input.name}" updated`);
      } else {
        await createTable.mutateAsync(input);
        toast.success(`Table "${input.name}" created`);
      }
      setIsFormOpen(false);
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTable.mutateAsync(id);
      toast.success("Table deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const handleStatusChange = async (id: bigint, status: TableStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Table status updated");
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleQRScan = async () => {
    setQrScanOpen(true);
    await qrScanner.startScanning();
  };

  const handleQRClose = async () => {
    await qrScanner.stopScanning();
    setQrScanOpen(false);
  };

  const latestQR = qrScanner.qrResults[0];

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tables</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tables.length} tables ·{" "}
            {tables.filter((t) => t.status === TableStatus.available).length}{" "}
            available
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleQRScan}
            data-ocid="tables.qr_scan.button"
          >
            <ScanLine size={16} className="mr-2" />
            Scan QR
          </Button>
          <Button onClick={openCreate} data-ocid="tables.add_table.button">
            <Plus size={16} className="mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="tables.loading_state"
        >
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <Skeleton key={k} className="h-36" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-16" data-ocid="tables.empty_state">
          <p className="text-muted-foreground">
            No tables yet. Add your first table.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          data-ocid="tables.list"
        >
          {tables.map((table, idx) => (
            <motion.div
              key={table.id.toString()}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card
                data-ocid={`tables.item.${idx + 1}`}
                className={`border shadow-card ${
                  tableStatusColor[table.status] || "bg-card border-border"
                }`}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-[15px] font-bold">
                        {table.name}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {table.capacity.toString()} seats
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] capitalize shrink-0 ${
                        statusBadgeClass[table.status] || ""
                      }`}
                    >
                      {table.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-1 mb-3">
                    <QrCode size={12} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-mono truncate">
                      {table.qrCode}
                    </span>
                  </div>

                  <div className="mb-3">
                    <Select
                      value={table.status}
                      onValueChange={(v) =>
                        handleStatusChange(table.id, v as TableStatus)
                      }
                    >
                      <SelectTrigger
                        className="h-7 text-xs"
                        data-ocid={`tables.status.select.${idx + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TableStatus.available}>
                          Available
                        </SelectItem>
                        <SelectItem value={TableStatus.occupied}>
                          Occupied
                        </SelectItem>
                        <SelectItem value={TableStatus.reserved}>
                          Reserved
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openEdit(table)}
                      data-ocid={`tables.edit_button.${idx + 1}`}
                    >
                      <Edit2 size={11} className="mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:text-destructive border-destructive/30"
                          data-ocid={`tables.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={11} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="tables.delete.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {table.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this table.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="tables.delete.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(table.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="tables.delete.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Table Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent data-ocid="tables.form.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="table-name">Table Name *</Label>
              <Input
                id="table-name"
                placeholder="e.g. Table 1, VIP Booth"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="tables.form.name.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-capacity">Capacity</Label>
              <Input
                id="table-capacity"
                type="number"
                min="1"
                max="20"
                placeholder="4"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, capacity: e.target.value }))
                }
                data-ocid="tables.form.capacity.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-qr">QR Code</Label>
              <Input
                id="table-qr"
                placeholder="Auto-generated if empty"
                value={formData.qrCode}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, qrCode: e.target.value }))
                }
                data-ocid="tables.form.qrcode.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              data-ocid="tables.form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTable.isPending || updateTable.isPending}
              data-ocid="tables.form.submit_button"
            >
              {editingTable ? "Save Changes" : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <Dialog open={qrScanOpen} onOpenChange={handleQRClose}>
        <DialogContent data-ocid="tables.qr.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan Table QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
              <video
                ref={qrScanner.videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={qrScanner.canvasRef} className="hidden" />
              {!qrScanner.isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-sm">Starting camera...</p>
                </div>
              )}
            </div>
            {latestQR && (
              <div className="p-3 bg-success-light rounded-lg">
                <p className="text-success text-sm font-medium">
                  Scanned: {latestQR.data}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleQRClose}
              data-ocid="tables.qr.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
