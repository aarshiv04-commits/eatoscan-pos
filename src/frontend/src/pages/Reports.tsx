import { Badge } from "@/components/ui/badge";
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
import { BarChart3, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus } from "../backend.d";
import { formatPrice, getElapsedMinutes } from "../data/mockData";
import { useGetAllOrders, useGetAllTables } from "../hooks/useQueries";

export default function Reports() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const { data: tables = [] } = useGetAllTables();

  const completedOrders = orders.filter(
    (o) => o.status === OrderStatus.completed,
  );
  const allRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0,
  );
  const avgOrder =
    completedOrders.length > 0 ? allRevenue / completedOrders.length : 0;
  const cancelledCount = orders.filter(
    (o) => o.status === OrderStatus.cancelled,
  ).length;

  const summaryCards = [
    {
      label: "Total Revenue (Today)",
      value: formatPrice(BigInt(Math.round(allRevenue))),
      icon: DollarSign,
      change: "+12.5% vs yesterday",
      positive: true,
    },
    {
      label: "Orders Completed",
      value: completedOrders.length.toString(),
      icon: ShoppingBag,
      change: `${orders.length} total orders`,
      positive: null,
    },
    {
      label: "Avg Order Value",
      value: formatPrice(BigInt(Math.round(avgOrder))),
      icon: TrendingUp,
      change: "Per completed order",
      positive: null,
    },
    {
      label: "Tables Served",
      value: tables.filter((t) => t.status !== "available").length.toString(),
      icon: BarChart3,
      change: `${cancelledCount} cancelled`,
      positive: cancelledCount === 0,
    },
  ];

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-gold" />
          Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Today's performance overview
        </p>
      </div>

      {/* Summary Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                className="shadow-card border-border"
                data-ocid={`reports.summary.item.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[13px] text-muted-foreground font-medium mb-2">
                        {card.label}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-2xl font-extrabold">{card.value}</p>
                      )}
                      {card.change && (
                        <Badge
                          className={`mt-2 text-[11px] ${
                            card.positive === true
                              ? "bg-success-light text-success border-0"
                              : "bg-secondary text-muted-foreground border-0"
                          }`}
                        >
                          {card.change}
                        </Badge>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center">
                      <card.icon size={22} className="text-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Completed Orders Table */}
      <section>
        <h2 className="text-base font-semibold mb-4">Completed Orders</h2>
        <Card className="shadow-card border-border">
          {isLoading ? (
            <div
              className="p-4 space-y-3"
              data-ocid="reports.orders.loading_state"
            >
              {["a", "b", "c", "d"].map((k) => (
                <Skeleton key={k} className="h-10" />
              ))}
            </div>
          ) : completedOrders.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="reports.orders.empty_state"
            >
              <p className="text-muted-foreground">
                No completed orders yet today.
              </p>
            </div>
          ) : (
            <Table data-ocid="reports.orders.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedOrders.map((order, idx) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const elapsed = getElapsedMinutes(order.createdAt);
                  return (
                    <TableRow
                      key={order.id.toString()}
                      data-ocid={`reports.orders.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell>
                        {table?.name || `Table ${order.tableId}`}
                      </TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{elapsed} min ago</TableCell>
                      <TableCell>
                        <Badge className="bg-success-light text-success border-0 text-[11px] capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </div>
  );
}
