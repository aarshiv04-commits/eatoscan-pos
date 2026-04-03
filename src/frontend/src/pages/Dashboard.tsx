import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart3,
  Plus,
  ShoppingBag,
  Table2,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus, TableStatus } from "../backend.d";
import { formatPrice, getElapsedMinutes } from "../data/mockData";
import { useGetAllTables } from "../hooks/useQueries";
import { useGetAllOrders } from "../hooks/useQueries";

const statusColorMap: Record<string, string> = {
  [OrderStatus.pending]: "bg-warning-light text-warning border-0",
  [OrderStatus.preparing]: "bg-warning-light text-warning border-0",
  [OrderStatus.ready]: "bg-success-light text-success border-0",
  [OrderStatus.served]: "bg-success-light text-success border-0",
  [OrderStatus.completed]: "bg-secondary text-muted-foreground border-0",
  [OrderStatus.cancelled]: "bg-destructive/10 text-destructive border-0",
};

const tableCardStyle: Record<string, string> = {
  [TableStatus.occupied]:
    "bg-[oklch(0.96_0.04_70)] border-[oklch(0.88_0.05_70)]",
  [TableStatus.available]:
    "bg-[oklch(0.95_0.04_145)] border-[oklch(0.87_0.05_145)]",
  [TableStatus.reserved]: "bg-secondary border-border",
};

export default function Dashboard() {
  const { data: tables = [], isLoading: tablesLoading } = useGetAllTables();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();

  const occupiedTables = tables.filter(
    (t) => t.status === TableStatus.occupied,
  );
  const availableTables = tables.filter(
    (t) => t.status === TableStatus.available,
  );
  const activeOrders = orders.filter(
    (o) =>
      o.status === OrderStatus.pending || o.status === OrderStatus.preparing,
  );
  const completedToday = orders.filter(
    (o) => o.status === OrderStatus.completed,
  );
  const totalRevenue = completedToday.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0,
  );

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: formatPrice(BigInt(Math.round(totalRevenue))),
      icon: TrendingUp,
      change: "+12.5%",
      positive: true,
    },
    {
      label: "Total Orders",
      value: orders.length.toString(),
      icon: ShoppingBag,
      change: "+3 today",
      positive: true,
    },
    {
      label: "Occupied Tables",
      value: occupiedTables.length.toString(),
      icon: Users,
      change: `of ${tables.length} total`,
      positive: null,
    },
    {
      label: "Available Tables",
      value: availableTables.length.toString(),
      icon: Table2,
      change: "Ready to serve",
      positive: true,
    },
  ];

  return (
    <div className="px-8 py-6 space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <section>
        <h2 className="text-[15px] font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          Today's Overview
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="shadow-card border-border hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-muted-foreground font-medium mb-2 truncate">
                        {card.label}
                      </p>
                      <p className="text-2xl font-extrabold text-foreground leading-none">
                        {tablesLoading || ordersLoading ? (
                          <Skeleton className="h-7 w-24" />
                        ) : (
                          card.value
                        )}
                      </p>
                      {card.change && (
                        <div className="mt-2">
                          <Badge
                            className={`text-[11px] font-semibold px-2 py-0.5 ${
                              card.positive === true
                                ? "bg-success-light text-success border-0"
                                : card.positive === false
                                  ? "bg-destructive/10 text-destructive border-0"
                                  : "bg-secondary text-muted-foreground border-0"
                            }`}
                          >
                            {card.change}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center shrink-0">
                      <card.icon size={22} className="text-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Table + Active Orders */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        {/* Live Table Management */}
        <Card className="shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Live Table Management
            </CardTitle>
            <Link to="/tables">
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-secondary"
              >
                View All
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            {tablesLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {tables.slice(0, 9).map((table, idx) => (
                  <Link key={table.id.toString()} to="/tables">
                    <div
                      data-ocid={`tables.item.${idx + 1}`}
                      className={`rounded-xl border p-3 cursor-pointer hover:opacity-90 transition-opacity ${
                        tableCardStyle[table.status] ||
                        "bg-secondary border-border"
                      }`}
                    >
                      <p className="font-bold text-foreground text-[13px]">
                        {table.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                        {table.status === TableStatus.available
                          ? "Available | QR Scanned"
                          : table.status}
                      </p>
                      {table.status === TableStatus.occupied &&
                        table.currentOrderId && (
                          <p className="text-[11px] text-foreground/70 mt-1 font-medium">
                            Dining | Order #{table.currentOrderId.toString()}
                          </p>
                        )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Active Orders
            </CardTitle>
            <Link to="/orders">
              <Button
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={13} className="mr-1" />
                Add New Order
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-4 space-y-3">
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="p-8 text-center" data-ocid="orders.empty_state">
                <p className="text-muted-foreground text-sm">
                  No active orders right now
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Table</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.map((order, idx) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    const elapsed = getElapsedMinutes(order.createdAt);
                    return (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`orders.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs font-medium">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {table?.name || `T${order.tableId}`}
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.items.length} items
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[11px] capitalize ${statusColorMap[order.status] || ""}`}
                          >
                            {order.status} - {elapsed} mins
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-right">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-[15px] font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "New Order",
              desc: "Start a new table order",
              icon: Plus,
              path: "/orders",
            },
            {
              label: "Manage Menu",
              desc: "Update items & categories",
              icon: UtensilsCrossed,
              path: "/menu",
            },
            {
              label: "View Reports",
              desc: "Daily revenue & insights",
              icon: BarChart3,
              path: "/reports",
            },
          ].map((action, idx) => (
            <Link key={action.path} to={action.path}>
              <Card
                data-ocid={`dashboard.quick_actions.item.${idx + 1}`}
                className="shadow-card border-border hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gold-light flex items-center justify-center shrink-0">
                    <action.icon size={20} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[14px]">
                      {action.label}
                    </p>
                    <p className="text-muted-foreground text-[12px] truncate">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
