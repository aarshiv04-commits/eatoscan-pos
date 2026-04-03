import type { Tenant, TenantInput } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useActivateTenant,
  useCreateTenant,
  useDeleteTenant,
  useGetAllTenants,
  useSuspendTenant,
  useUpdateTenant,
} from "@/hooks/useSuperAdminQueries";
import {
  Building2,
  Edit,
  Loader2,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const PLAN_OPTIONS = ["starter", "pro", "enterprise"];
const STATUS_OPTIONS = ["active", "trial", "suspended"];

const EMPTY_FORM: TenantInput = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  plan: "starter" as any,
  status: "trial" as any,
  outletCount: 1n,
  monthlyRevenue: 0n,
  city: "",
  country: "",
};

function getPlanStyle(plan: string) {
  switch (plan) {
    case "enterprise":
      return {
        background: "oklch(0.88 0.10 295)",
        color: "oklch(0.30 0.18 295)",
      };
    case "pro":
      return {
        background: "oklch(0.88 0.08 230)",
        color: "oklch(0.28 0.15 230)",
      };
    default:
      return {
        background: "oklch(0.93 0.01 250)",
        color: "oklch(0.45 0.02 250)",
      };
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return {
        background: "oklch(0.88 0.10 145)",
        color: "oklch(0.30 0.15 145)",
      };
    case "suspended":
      return {
        background: "oklch(0.92 0.08 25)",
        color: "oklch(0.35 0.18 25)",
      };
    case "trial":
      return {
        background: "oklch(0.92 0.10 75)",
        color: "oklch(0.38 0.12 55)",
      };
    default:
      return {
        background: "oklch(0.93 0.01 250)",
        color: "oklch(0.45 0.02 250)",
      };
  }
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1e6;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type DialogMode = "create" | "edit" | null;
type ConfirmAction = {
  type: "suspend" | "activate" | "delete";
  tenant: Tenant;
} | null;

export default function Clients() {
  const { data: tenants, isLoading } = useGetAllTenants();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const suspendTenant = useSuspendTenant();
  const activateTenant = useActivateTenant();
  const deleteTenant = useDeleteTenant();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState<TenantInput>(EMPTY_FORM);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");

  const filtered = (tenants ?? []).filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.businessName.toLowerCase().includes(q) ||
      t.ownerName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === "all" || (t.status as string) === filterStatus;
    const matchesPlan =
      filterPlan === "all" || (t.plan as string) === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTenant(null);
    setDialogMode("create");
  }

  function openEdit(tenant: Tenant) {
    setForm({
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      email: tenant.email,
      phone: tenant.phone,
      plan: tenant.plan,
      status: tenant.status,
      outletCount: tenant.outletCount,
      monthlyRevenue: tenant.monthlyRevenue,
      city: tenant.city,
      country: tenant.country,
    });
    setEditTenant(tenant);
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setEditTenant(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    try {
      if (dialogMode === "create") {
        await createTenant.mutateAsync(form);
        toast.success("Client created successfully");
      } else if (dialogMode === "edit" && editTenant) {
        await updateTenant.mutateAsync({ id: editTenant.id, input: form });
        toast.success("Client updated successfully");
      }
      closeDialog();
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "delete") {
        await deleteTenant.mutateAsync(confirmAction.tenant.id);
        toast.success(`${confirmAction.tenant.businessName} deleted.`);
      } else if (confirmAction.type === "suspend") {
        await suspendTenant.mutateAsync(confirmAction.tenant.id);
        toast.success(`${confirmAction.tenant.businessName} suspended.`);
      } else if (confirmAction.type === "activate") {
        await activateTenant.mutateAsync(confirmAction.tenant.id);
        toast.success(`${confirmAction.tenant.businessName} reactivated.`);
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }
    setConfirmAction(null);
  }

  const isPending =
    createTenant.isPending ||
    updateTenant.isPending ||
    suspendTenant.isPending ||
    activateTenant.isPending ||
    deleteTenant.isPending;

  return (
    <div className="space-y-6" data-ocid="superadmin.clients.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.18 0.04 250)" }}
          >
            Client Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.02 250)" }}>
            Manage all restaurant and cafe clients on your platform.
          </p>
        </div>
        <Button
          onClick={openCreate}
          data-ocid="superadmin.clients.add.primary_button"
          style={{ background: "oklch(0.72 0.18 35)", color: "white" }}
          className="flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 p-4 rounded-xl border-0 shadow-card"
        style={{ background: "oklch(1 0 0)" }}
      >
        <div className="flex-1 min-w-48 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "oklch(0.65 0.02 250)" }}
          />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-ocid="superadmin.clients.search_input"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            className="w-36"
            data-ocid="superadmin.clients.status.select"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger
            className="w-36"
            data-ocid="superadmin.clients.plan.select"
          >
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {PLAN_OPTIONS.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border-0 shadow-card overflow-hidden"
        style={{ background: "oklch(1 0 0)" }}
      >
        {isLoading ? (
          <div
            className="p-6 space-y-3"
            data-ocid="superadmin.clients.loading_state"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="superadmin.clients.empty_state"
          >
            <Building2
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.75 0.02 250)" }}
            />
            <p
              className="font-medium"
              style={{ color: "oklch(0.45 0.02 250)" }}
            >
              No clients found
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.60 0.02 250)" }}
            >
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Add your first client to get started."}
            </p>
          </div>
        ) : (
          <Table data-ocid="superadmin.clients.table">
            <TableHeader>
              <TableRow
                style={{ borderBottom: "1px solid oklch(0.93 0.008 250)" }}
              >
                {[
                  "Business",
                  "Owner",
                  "Plan",
                  "Status",
                  "Outlets",
                  "Revenue/mo",
                  "Location",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tenant: Tenant, idx: number) => (
                <TableRow
                  key={String(tenant.id)}
                  className="hover:bg-gray-50/60 transition-colors"
                  data-ocid={`superadmin.clients.row.${idx + 1}`}
                >
                  <TableCell>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.18 0.04 250)" }}
                      >
                        {tenant.businessName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.02 250)" }}
                      >
                        {tenant.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.28 0.02 250)" }}
                    >
                      {tenant.ownerName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.015 250)" }}
                    >
                      {tenant.phone}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={getPlanStyle(tenant.plan as string)}
                    >
                      {tenant.plan as string}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={getStatusStyle(tenant.status as string)}
                    >
                      {tenant.status as string}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-sm text-center"
                    style={{ color: "oklch(0.28 0.02 250)" }}
                  >
                    {Number(tenant.outletCount)}
                  </TableCell>
                  <TableCell
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.28 0.04 145)" }}
                  >
                    ${Number(tenant.monthlyRevenue).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className="text-sm"
                    style={{ color: "oklch(0.45 0.02 250)" }}
                  >
                    {tenant.city}, {tenant.country}
                  </TableCell>
                  <TableCell
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    {formatDate(tenant.joinedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(tenant)}
                        data-ocid={`superadmin.clients.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {(tenant.status as string) === "suspended" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setConfirmAction({ type: "activate", tenant })
                          }
                          title="Activate"
                          data-ocid={`superadmin.clients.toggle.${idx + 1}`}
                        >
                          <PlayCircle
                            className="w-3.5 h-3.5"
                            style={{ color: "oklch(0.55 0.18 145)" }}
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setConfirmAction({ type: "suspend", tenant })
                          }
                          title="Suspend"
                          data-ocid={`superadmin.clients.toggle.${idx + 1}`}
                        >
                          <PauseCircle
                            className="w-3.5 h-3.5"
                            style={{ color: "oklch(0.60 0.15 55)" }}
                          />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          setConfirmAction({ type: "delete", tenant })
                        }
                        data-ocid={`superadmin.clients.delete_button.${idx + 1}`}
                      >
                        <Trash2
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.55 0.20 25)" }}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="superadmin.clients.modal"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.18 0.04 250)" }}>
              {dialogMode === "create" ? "Add New Client" : "Edit Client"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Onboard a new restaurant or cafe to the EAT&#39;O&#39;SCAN platform."
                : "Update client details and subscription information."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, businessName: e.target.value }))
                }
                placeholder="e.g. Spice Garden Restaurant"
                data-ocid="superadmin.clients.businessname.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerName: e.target.value }))
                }
                placeholder="Full name"
                data-ocid="superadmin.clients.ownername.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="owner@business.com"
                data-ocid="superadmin.clients.email.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+1-555-000-0000"
                data-ocid="superadmin.clients.phone.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select
                value={form.plan as string}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, plan: v as any }))
                }
              >
                <SelectTrigger data-ocid="superadmin.clients.plan.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status as string}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as any }))
                }
              >
                <SelectTrigger data-ocid="superadmin.clients.status_field.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outletCount">Number of Outlets</Label>
              <Input
                id="outletCount"
                type="number"
                min="1"
                value={Number(form.outletCount)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    outletCount: BigInt(e.target.value || 1),
                  }))
                }
                data-ocid="superadmin.clients.outlets.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlyRevenue">Monthly Revenue (USD)</Label>
              <Input
                id="monthlyRevenue"
                type="number"
                min="0"
                value={Number(form.monthlyRevenue)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    monthlyRevenue: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="0"
                data-ocid="superadmin.clients.revenue.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                placeholder="City name"
                data-ocid="superadmin.clients.city.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
                placeholder="Country name"
                data-ocid="superadmin.clients.country.input"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={closeDialog}
              data-ocid="superadmin.clients.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isPending ||
                !form.businessName ||
                !form.ownerName ||
                !form.email
              }
              data-ocid="superadmin.clients.submit_button"
              style={{ background: "oklch(0.72 0.18 35)", color: "white" }}
              className="hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : dialogMode === "create" ? (
                "Add Client"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent data-ocid="superadmin.clients.confirm.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete"
                ? "Delete Client"
                : confirmAction?.type === "suspend"
                  ? "Suspend Client"
                  : "Activate Client"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? `Are you sure you want to permanently delete ${confirmAction.tenant.businessName}? This action cannot be undone.`
                : confirmAction?.type === "suspend"
                  ? `This will suspend ${confirmAction?.tenant.businessName} and revoke their platform access.`
                  : `This will reactivate ${confirmAction?.tenant.businessName} and restore platform access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="superadmin.clients.confirm.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              data-ocid="superadmin.clients.confirm.confirm_button"
              style={{
                background:
                  confirmAction?.type === "delete" ||
                  confirmAction?.type === "suspend"
                    ? "oklch(0.55 0.20 25)"
                    : "oklch(0.55 0.18 145)",
              }}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {confirmAction?.type === "delete"
                ? "Delete"
                : confirmAction?.type === "suspend"
                  ? "Suspend"
                  : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
