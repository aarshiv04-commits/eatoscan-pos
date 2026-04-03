import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  BadgeCheck,
  Building2,
  Globe,
  HeadphonesIcon,
  Info,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    outlets: "1 outlet",
    users: "5 users",
    features: ["Basic POS features", "Email support", "Standard reports"],
    color: "oklch(0.65 0.02 250)",
    bg: "oklch(0.96 0.01 250)",
    border: "oklch(0.88 0.02 250)",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    outlets: "5 outlets",
    users: "25 users",
    features: ["Advanced analytics", "Priority support", "Custom branding"],
    color: "oklch(0.50 0.18 230)",
    bg: "oklch(0.95 0.05 230)",
    border: "oklch(0.82 0.10 230)",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    outlets: "Unlimited outlets",
    users: "Unlimited users",
    features: [
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
    ],
    color: "oklch(0.50 0.18 295)",
    bg: "oklch(0.95 0.05 295)",
    border: "oklch(0.82 0.10 295)",
  },
];

export default function SuperAdminSettings() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "Not connected";

  return (
    <div className="space-y-8 max-w-4xl" data-ocid="superadmin.settings.page">
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
          Platform Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.02 250)" }}>
          Configuration and reference information for the EAT&#39;O&#39;SCAN
          SaaS platform.
        </p>
      </motion.div>

      {/* Platform Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className="border-0 shadow-card"
          style={{ background: "oklch(1 0 0)" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "oklch(0.18 0.04 250)" }}
            >
              <Info
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.72 0.18 35)" }}
              />
              Platform Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "oklch(0.60 0.02 250)" }}
                >
                  Platform Name
                </p>
                <div className="flex items-center gap-2">
                  <Building2
                    className="w-4 h-4"
                    style={{ color: "oklch(0.72 0.18 35)" }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.18 0.04 250)" }}
                  >
                    EAT&#39;O&#39;SCAN POS
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "oklch(0.60 0.02 250)" }}
                >
                  Platform Version
                </p>
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    className="w-4 h-4"
                    style={{ color: "oklch(0.55 0.18 145)" }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.18 0.04 250)" }}
                  >
                    v2.0.0 — Stable
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "oklch(0.60 0.02 250)" }}
                >
                  Deployment
                </p>
                <div className="flex items-center gap-2">
                  <Globe
                    className="w-4 h-4"
                    style={{ color: "oklch(0.50 0.18 230)" }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.18 0.04 250)" }}
                  >
                    Internet Computer Protocol (ICP)
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "oklch(0.60 0.02 250)" }}
                >
                  Serving Sectors
                </p>
                <div className="flex items-center gap-2">
                  <Globe
                    className="w-4 h-4"
                    style={{ color: "oklch(0.50 0.18 295)" }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.18 0.04 250)" }}
                  >
                    Restaurants, Cafes &amp; Food Hospitality
                  </p>
                </div>
              </div>
            </div>

            <Separator style={{ borderColor: "oklch(0.93 0.008 250)" }} />

            <div className="space-y-1">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "oklch(0.60 0.02 250)" }}
              >
                Super Admin Principal
              </p>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.18 35)" }}
                />
                <code
                  className="text-sm font-mono px-2 py-1 rounded"
                  style={{
                    background: "oklch(0.96 0.01 250)",
                    color: "oklch(0.25 0.04 250)",
                    wordBreak: "break-all",
                  }}
                >
                  {principal}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card
          className="border-0 shadow-card"
          style={{ background: "oklch(1 0 0)" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "oklch(0.18 0.04 250)" }}
            >
              <BadgeCheck
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.72 0.18 35)" }}
              />
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="rounded-xl p-5 border"
                  style={{
                    background: plan.bg,
                    borderColor: plan.border,
                  }}
                  data-ocid={`superadmin.settings.plan.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: plan.color }}
                      >
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "oklch(0.18 0.04 250)" }}
                        >
                          {plan.price}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "oklch(0.55 0.02 250)" }}
                        >
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div
                      className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block"
                      style={{
                        background: `${plan.color}20`,
                        color: plan.color,
                      }}
                    >
                      {plan.outlets}
                    </div>
                    <div
                      className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block ml-1"
                      style={{
                        background: `${plan.color}20`,
                        color: plan.color,
                      }}
                    >
                      {plan.users}
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "oklch(0.38 0.02 250)" }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: plan.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className="border-0 shadow-card"
          style={{ background: "oklch(1 0 0)" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "oklch(0.18 0.04 250)" }}
            >
              <HeadphonesIcon
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.72 0.18 35)" }}
              />
              Contact &amp; Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: "oklch(0.45 0.02 250)" }}>
              For platform-level issues, billing disputes, or technical
              escalations, reach the engineering team:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{
                  borderColor: "oklch(0.90 0.015 250)",
                  background: "oklch(0.975 0.005 250)",
                }}
              >
                <Mail
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.18 35)" }}
                />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    Technical Support
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.25 0.04 250)" }}
                  >
                    support@eatoscan.com
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{
                  borderColor: "oklch(0.90 0.015 250)",
                  background: "oklch(0.975 0.005 250)",
                }}
              >
                <Globe
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "oklch(0.50 0.18 230)" }}
                />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    Documentation
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.25 0.04 250)" }}
                  >
                    docs.eatoscan.com
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
