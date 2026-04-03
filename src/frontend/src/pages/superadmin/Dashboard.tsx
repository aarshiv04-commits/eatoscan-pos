import type { Tenant } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllTenants,
  useGetPlatformStats,
} from "@/hooks/useSuperAdminQueries";
import {
  Activity,
  BadgeCheck,
  Building2,
  DollarSign,
  PauseCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

function getPlanBadgeStyle(plan: string) {
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

function getStatusBadgeStyle(status: string) {
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

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats();
  const { data: tenants, isLoading: tenantsLoading } = useGetAllTenants();

  const recentTenants = tenants?.slice(0, 5) ?? [];

  const starterCount =
    tenants?.filter((t) => t.plan === ("starter" as any)).length ?? 0;
  const proCount =
    tenants?.filter((t) => t.plan === ("pro" as any)).length ?? 0;
  const enterpriseCount =
    tenants?.filter((t) => t.plan === ("enterprise" as any)).length ?? 0;
  const totalCount = tenants?.length ?? 1;

  const kpiCards = [
    {
      label: "Total Clients",
      value: stats ? Number(stats.totalTenants) : 0,
      icon: Users,
      color: "oklch(0.72 0.18 35)",
      bgColor: "oklch(0.72 0.18 35 / 0.10)",
      suffix: "",
    },
    {
      label: "Active Clients",
      value: stats ? Number(stats.activeTenants) : 0,
      icon: BadgeCheck,
      color: "oklch(0.55 0.18 145)",
      bgColor: "oklch(0.55 0.18 145 / 0.10)",
      suffix: "",
    },
    {
      label: "Suspended",
      value: stats ? Number(stats.suspendedTenants) : 0,
      icon: PauseCircle,
      color: "oklch(0.55 0.20 25)",
      bgColor: "oklch(0.55 0.20 25 / 0.10)",
      suffix: "",
    },
    {
      label: "On Trial",
      value: stats ? Number(stats.trialTenants) : 0,
      icon: Activity,
      color: "oklch(0.60 0.15 55)",
      bgColor: "oklch(0.60 0.15 55 / 0.10)",
      suffix: "",
    },
    {
      label: "Monthly Revenue",
      value: stats ? Number(stats.totalMonthlyRevenue) : 0,
      icon: DollarSign,
      color: "oklch(0.50 0.18 260)",
      bgColor: "oklch(0.50 0.18 260 / 0.10)",
      prefix: "$",
      suffix: "",
      format: true,
    },
  ];

  return (
    <div className="space-y-8" data-ocid="superadmin.dashboard.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.18 0.04 250)" }}
        >
          Platform Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.02 250)" }}>
          Monitor your EAT&#39;O&#39;SCAN SaaS platform metrics and client
          activity.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card
                className="border-0 shadow-card"
                style={{ background: "oklch(1 0 0)" }}
                data-ocid={`superadmin.dashboard.card.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: "oklch(0.55 0.02 250)" }}
                      >
                        {card.label}
                      </p>
                      {statsLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "oklch(0.18 0.04 250)" }}
                        >
                          {card.prefix}
                          {card.format
                            ? card.value.toLocaleString()
                            : card.value}
                        </p>
                      )}
                    </div>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: card.bgColor }}
                    >
                      <Icon
                        className="w-4.5 h-4.5"
                        style={{ color: card.color }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <Card
            className="border-0 shadow-card"
            style={{ background: "oklch(1 0 0)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="text-base font-semibold"
                style={{ color: "oklch(0.18 0.04 250)" }}
              >
                Recent Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tenantsLoading ? (
                <div className="px-6 pb-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Skeleton key={n} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid oklch(0.93 0.008 250)",
                        }}
                      >
                        {["Business", "Plan", "Status", "Country"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-xs font-semibold"
                            style={{ color: "oklch(0.55 0.02 250)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentTenants.map((tenant: Tenant, idx: number) => (
                        <tr
                          key={String(tenant.id)}
                          className="transition-colors hover:bg-gray-50/60"
                          style={{
                            borderBottom:
                              idx < recentTenants.length - 1
                                ? "1px solid oklch(0.96 0.005 250)"
                                : "none",
                          }}
                          data-ocid={`superadmin.tenant.row.${idx + 1}`}
                        >
                          <td className="px-6 py-3">
                            <div>
                              <p
                                className="text-sm font-medium"
                                style={{ color: "oklch(0.18 0.04 250)" }}
                              >
                                {tenant.businessName}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "oklch(0.55 0.02 250)" }}
                              >
                                {tenant.ownerName}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                              style={getPlanBadgeStyle(tenant.plan as string)}
                            >
                              {tenant.plan as string}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                              style={getStatusBadgeStyle(
                                tenant.status as string,
                              )}
                            >
                              {tenant.status as string}
                            </span>
                          </td>
                          <td
                            className="px-6 py-3 text-sm"
                            style={{ color: "oklch(0.45 0.02 250)" }}
                          >
                            {tenant.country}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <Card
            className="border-0 shadow-card"
            style={{ background: "oklch(1 0 0)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="text-base font-semibold"
                style={{ color: "oklch(0.18 0.04 250)" }}
              >
                Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 rounded-full flex-1 overflow-hidden"
                  style={{ background: "oklch(0.93 0.01 250)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(starterCount / totalCount) * 100}%`,
                      background: "oklch(0.65 0.02 250)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.45 0.02 250)" }}
                  >
                    Starter
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {starterCount}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-2 rounded-full flex-1 overflow-hidden"
                  style={{ background: "oklch(0.93 0.01 250)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(proCount / totalCount) * 100}%`,
                      background: "oklch(0.50 0.18 230)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.45 0.02 250)" }}
                  >
                    Pro
                  </span>
                  <Badge
                    className="ml-auto text-xs"
                    style={{
                      background: "oklch(0.88 0.08 230)",
                      color: "oklch(0.28 0.15 230)",
                    }}
                  >
                    {proCount}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-2 rounded-full flex-1 overflow-hidden"
                  style={{ background: "oklch(0.93 0.01 250)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(enterpriseCount / totalCount) * 100}%`,
                      background: "oklch(0.50 0.18 295)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.45 0.02 250)" }}
                  >
                    Enterprise
                  </span>
                  <Badge
                    className="ml-auto text-xs"
                    style={{
                      background: "oklch(0.88 0.10 295)",
                      color: "oklch(0.30 0.18 295)",
                    }}
                  >
                    {enterpriseCount}
                  </Badge>
                </div>
              </div>

              <div
                className="pt-4 border-t"
                style={{ borderColor: "oklch(0.93 0.008 250)" }}
              >
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "oklch(0.45 0.02 250)" }}
                >
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "oklch(0.72 0.18 35)" }}
                  />
                  <span>
                    <strong style={{ color: "oklch(0.18 0.04 250)" }}>
                      $
                      {stats
                        ? Number(stats.totalMonthlyRevenue).toLocaleString()
                        : 0}
                    </strong>{" "}
                    /mo revenue
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm mt-2"
                  style={{ color: "oklch(0.45 0.02 250)" }}
                >
                  <Building2
                    className="w-4 h-4"
                    style={{ color: "oklch(0.50 0.18 260)" }}
                  />
                  <span>
                    <strong style={{ color: "oklch(0.18 0.04 250)" }}>
                      {tenants?.reduce(
                        (sum, t) => sum + Number(t.outletCount),
                        0,
                      ) ?? 0}
                    </strong>{" "}
                    total outlets
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
