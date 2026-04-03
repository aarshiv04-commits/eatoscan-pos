import type { AuditLog as AuditLogEntry } from "@/backend.d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAuditLogs } from "@/hooks/useSuperAdminQueries";
import { ClipboardList, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

const ACTION_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  CREATE: {
    bg: "oklch(0.88 0.10 145)",
    text: "oklch(0.30 0.15 145)",
    label: "Create",
  },
  UPDATE: {
    bg: "oklch(0.88 0.08 230)",
    text: "oklch(0.28 0.15 230)",
    label: "Update",
  },
  SUSPEND: {
    bg: "oklch(0.92 0.08 25)",
    text: "oklch(0.35 0.18 25)",
    label: "Suspend",
  },
  ACTIVATE: {
    bg: "oklch(0.88 0.10 145)",
    text: "oklch(0.30 0.15 145)",
    label: "Activate",
  },
  DELETE: {
    bg: "oklch(0.92 0.10 10)",
    text: "oklch(0.38 0.20 10)",
    label: "Delete",
  },
};

function getActionStyle(action: string) {
  return (
    ACTION_STYLES[action.toUpperCase()] ?? {
      bg: "oklch(0.93 0.01 250)",
      text: "oklch(0.45 0.02 250)",
      label: action,
    }
  );
}

function formatTimestamp(nanoseconds: bigint): { date: string; time: string } {
  const ms = Number(nanoseconds) / 1e6;
  const d = new Date(ms);
  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function truncatePrincipal(p: string): string {
  if (p.length <= 20) return p;
  return `${p.slice(0, 8)}...${p.slice(-6)}`;
}

export default function AuditLogPage() {
  const { data: logs, isLoading } = useGetAuditLogs();

  return (
    <div className="space-y-6" data-ocid="superadmin.audit.page">
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
          Audit Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.02 250)" }}>
          Full record of all administrative actions on the platform.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className="border-0 shadow-card"
          style={{ background: "oklch(1 0 0)" }}
        >
          <CardHeader className="pb-0">
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "oklch(0.18 0.04 250)" }}
            >
              <ShieldAlert
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.72 0.18 35)" }}
              />
              Activity History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {isLoading ? (
              <div
                className="px-6 pb-4 space-y-3"
                data-ocid="superadmin.audit.loading_state"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Skeleton key={n} className="h-16 w-full" />
                ))}
              </div>
            ) : !logs || logs.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="superadmin.audit.empty_state"
              >
                <ClipboardList
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: "oklch(0.75 0.02 250)" }}
                />
                <p
                  className="font-medium"
                  style={{ color: "oklch(0.45 0.02 250)" }}
                >
                  No audit logs yet
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.60 0.02 250)" }}
                >
                  Admin actions will appear here once they occur.
                </p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "oklch(0.96 0.005 250)" }}
              >
                {logs.map((log: AuditLogEntry, idx: number) => {
                  const style = getActionStyle(log.action);
                  const { date, time } = formatTimestamp(log.timestamp);
                  const principalText =
                    typeof log.actorPrincipal === "object" &&
                    "toText" in log.actorPrincipal
                      ? (log.actorPrincipal as any).toText()
                      : String(log.actorPrincipal);

                  return (
                    <motion.div
                      key={String(log.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                      data-ocid={`superadmin.audit.row.${idx + 1}`}
                    >
                      {/* Action badge */}
                      <div className="flex-shrink-0 pt-0.5">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{ background: style.bg, color: style.text }}
                        >
                          {style.label}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm"
                          style={{ color: "oklch(0.22 0.025 250)" }}
                        >
                          {log.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className="text-xs font-mono"
                            style={{ color: "oklch(0.65 0.015 250)" }}
                          >
                            {truncatePrincipal(principalText)}
                          </span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-right">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "oklch(0.40 0.02 250)" }}
                        >
                          {date}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.60 0.015 250)" }}
                        >
                          {time}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
