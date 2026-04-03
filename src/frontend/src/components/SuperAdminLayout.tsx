import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNotifications } from "@/hooks/useSuperAdminQueries";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  BellRing,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/superadmin" },
  { label: "Clients", icon: Users, href: "/superadmin/clients" },
  { label: "Audit Log", icon: ClipboardList, href: "/superadmin/audit" },
  { label: "Settings", icon: Settings, href: "/superadmin/settings" },
];

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-6)}`;
}

export function formatTimeAgo(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const diffMs = Date.now() - ms;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return new Date(ms).toLocaleDateString();
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const handleViewAllClients = () => {
    setOpen(false);
    navigate({ to: "/superadmin/clients" });
  };

  const BellIcon = unreadCount > 0 ? BellRing : Bell;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid="notifications.open_modal_button"
          className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2"
          style={
            {
              color:
                unreadCount > 0
                  ? "oklch(0.72 0.18 35)"
                  : "oklch(0.45 0.02 250)",
              // biome-ignore lint/style/useTemplate: cleaner here
              "--tw-ring-color": "oklch(0.72 0.18 35 / 0.5)",
            } as React.CSSProperties
          }
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={unreadCount > 0 ? "ring" : "bell"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <BellIcon className="w-5 h-5" />
            </motion.div>
          </AnimatePresence>

          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              data-ocid="notifications.toast"
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none"
              style={{
                background: "oklch(0.60 0.22 25)",
                color: "oklch(0.99 0 0)",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 overflow-hidden shadow-xl"
        style={{
          border: "1px solid oklch(0.90 0.008 250)",
          borderRadius: "12px",
        }}
        data-ocid="notifications.popover"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: "oklch(0.98 0.005 250)",
            borderColor: "oklch(0.90 0.008 250)",
          }}
        >
          <div className="flex items-center gap-2">
            <BellRing
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.18 35)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.20 0.04 250)" }}
            >
              New Registrations
            </span>
          </div>
          {notifications.length > 0 && (
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: "oklch(0.72 0.18 35 / 0.15)",
                color: "oklch(0.55 0.18 35)",
              }}
            >
              {notifications.length}
            </span>
          )}
        </div>

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 px-4"
            data-ocid="notifications.empty_state"
          >
            <Bell
              className="w-8 h-8 mb-3"
              style={{ color: "oklch(0.80 0.01 250)" }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.55 0.02 250)" }}
            >
              No new registrations
            </p>
            <p
              className="text-xs mt-1 text-center"
              style={{ color: "oklch(0.70 0.01 250)" }}
            >
              New tenant sign-ups will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="py-1">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.tenant.id.toString()}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  data-ocid={`notifications.item.${index + 1}`}
                  className="px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-black/[0.02]"
                  style={{ borderColor: "oklch(0.93 0.006 250)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "oklch(0.72 0.18 35 / 0.12)" }}
                    >
                      <Store
                        className="w-4 h-4"
                        style={{ color: "oklch(0.60 0.18 35)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {notification.unread && (
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "oklch(0.60 0.22 25)" }}
                          />
                        )}
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "oklch(0.20 0.04 250)" }}
                        >
                          {notification.tenant.businessName}
                        </p>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "oklch(0.50 0.02 250)" }}
                      >
                        {notification.tenant.ownerName}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.65 0.015 250)" }}
                      >
                        {formatTimeAgo(notification.tenant.joinedAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div
          className="px-4 py-3 border-t"
          style={{
            background: "oklch(0.98 0.005 250)",
            borderColor: "oklch(0.90 0.008 250)",
          }}
        >
          <button
            type="button"
            onClick={handleViewAllClients}
            data-ocid="notifications.link"
            className="w-full text-sm font-medium text-center py-1 rounded-lg transition-all duration-150 hover:underline"
            style={{ color: "oklch(0.55 0.18 35)" }}
          >
            View All Clients →
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SuperAdminLayout() {
  const { identity, clear } = useInternetIdentity();
  const location = useLocation();
  const { markAsRead } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";

  // Auto-clear notifications when navigating to clients page
  useEffect(() => {
    if (location.pathname.startsWith("/superadmin/clients")) {
      markAsRead();
    }
  }, [location.pathname, markAsRead]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clear();
    setIsLoggingOut(false);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.97 0.005 250)" }}
    >
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-64 flex flex-col flex-shrink-0 h-full"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.04 250) 0%, oklch(0.22 0.035 252) 100%)",
        }}
      >
        {/* Logo */}
        <div
          className="px-6 pt-7 pb-6 border-b"
          style={{ borderColor: "oklch(0.30 0.04 250)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.72 0.18 35)" }}
            >
              <Activity
                className="w-5 h-5"
                style={{ color: "oklch(0.99 0 0)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-bold tracking-wide"
                style={{ color: "oklch(0.97 0.005 80)" }}
              >
                EAT&#39;O&#39;SCAN
              </p>
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5"
                style={{
                  background: "oklch(0.72 0.18 35 / 0.25)",
                  color: "oklch(0.85 0.12 40)",
                }}
              >
                <ShieldCheck className="w-3 h-3" />
                Super Admin
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/superadmin"
                ? location.pathname === "/superadmin" ||
                  location.pathname === "/superadmin/"
                : location.pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                data-ocid={`superadmin.nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive ? "text-white" : "hover:bg-white/5",
                )}
                style={isActive ? { background: "oklch(0.72 0.18 35)" } : {}}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-4.5 h-4.5 flex-shrink-0"
                    style={{
                      color: isActive
                        ? "oklch(0.99 0 0)"
                        : "oklch(0.70 0.02 250)",
                    }}
                  />
                  <span
                    style={{
                      color: isActive
                        ? "oklch(0.99 0 0)"
                        : "oklch(0.75 0.015 250)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.99 0 0 / 0.7)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "oklch(0.30 0.04 250)" }}
        >
          <div
            className="rounded-lg px-3 py-3 mb-3"
            style={{ background: "oklch(0.25 0.035 250)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.72 0.18 35)" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "oklch(0.72 0.18 35)" }}
              >
                Super Admin
              </span>
            </div>
            <p
              className="text-xs font-mono truncate"
              style={{ color: "oklch(0.55 0.015 250)" }}
            >
              {truncatePrincipal(principal)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-ocid="superadmin.logout.button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: "oklch(0.65 0.015 250)" }}
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0"
          style={{
            background: "oklch(1 0 0)",
            borderColor: "oklch(0.92 0.008 250)",
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="w-5 h-5"
              style={{ color: "oklch(0.72 0.18 35)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.25 0.04 250)" }}
            >
              EAT&#39;O&#39;SCAN Super Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Principal ID chip */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "oklch(0.18 0.04 250 / 0.08)",
                color: "oklch(0.25 0.04 250)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "oklch(0.55 0.18 145)" }}
              />
              <span className="font-mono">{truncatePrincipal(principal)}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-8"
          style={{ background: "oklch(0.97 0.005 250)" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
