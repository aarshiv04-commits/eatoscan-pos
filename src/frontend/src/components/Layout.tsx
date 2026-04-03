import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  ChefHat,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShoppingCart,
  Table2,
  UtensilsCrossed,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile } from "../hooks/useQueries";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Tables", icon: Table2, path: "/tables" },
  { label: "Menu", icon: UtensilsCrossed, path: "/menu" },
  { label: "Orders", icon: ShoppingCart, path: "/orders", badge: "3" },
  { label: "Kitchen", icon: ChefHat, path: "/kitchen" },
  { label: "Billing", icon: CreditCard, path: "/billing" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const [notifOpen, setNotifOpen] = useState(false);

  const userName = profile?.name || "Chef Alex";
  const userRole = profile?.role || "Restaurant Manager";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="sidebar-bg flex flex-col w-[270px] shrink-0 h-full overflow-y-auto"
        style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.18)" }}
      >
        {/* Brand block */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-sidebar-accent shrink-0">
            <img
              src="/assets/generated/eatoscan-logo-transparent.dim_80x80.png"
              alt="Eat'O'Scan"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-lg leading-none">
                Eat
              </span>
              <span className="text-gold font-bold text-lg leading-none">
                'O'
              </span>
              <span className="text-white font-bold text-lg leading-none">
                Scan
              </span>
            </div>
            <p className="text-sidebar-foreground/50 text-xs mt-0.5">
              Restaurant POS
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-4 flex flex-col gap-1"
          data-ocid="nav.section"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon
                  size={18}
                  className={
                    isActive
                      ? "text-gold"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                  }
                />
                <span
                  className={`text-[14px] font-medium flex-1 ${isActive ? "text-white" : ""}`}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-accent text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                    New {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-3 border-t border-sidebar-border" />

          <Link
            to="/settings"
            data-ocid="nav.settings.link"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
              currentPath === "/settings"
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
            }`}
          >
            <Settings
              size={18}
              className={
                currentPath === "/settings"
                  ? "text-gold"
                  : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
              }
            />
            <span className="text-[14px] font-medium">Settings</span>
          </Link>
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-white text-sm font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-semibold truncate">
                {userName}
              </p>
              <p className="text-sidebar-foreground/50 text-[11px] truncate">
                {userRole}
              </p>
            </div>
            {identity && (
              <button
                type="button"
                onClick={clear}
                className="text-sidebar-foreground/50 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shrink-0"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome Back, {userName.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Chat icon */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <MessageSquare size={16} className="text-muted-foreground" />
            </button>

            {/* Notification bell */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={() => setNotifOpen(!notifOpen)}
              data-ocid="header.bell.button"
            >
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                data-ocid="header.profile.button"
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {userName.split(" ")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/settings">Profile Settings</Link>
                </DropdownMenuItem>
                {identity && (
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive"
                  >
                    <LogOut size={14} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}

          {/* Footer */}
          <footer className="border-t border-border px-8 py-4 flex items-center justify-between bg-card mt-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <img
                src="/assets/generated/eatoscan-logo-transparent.dim_80x80.png"
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>
                Eat&apos;O&apos;Scan &copy; {new Date().getFullYear()}{" "}
                Eat&apos;O&apos;Scan Inc.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-default">
                Privacy Policy
              </span>
              <span className="hover:text-foreground transition-colors cursor-default">
                Terms
              </span>
              <span className="hover:text-foreground transition-colors cursor-default">
                Support
              </span>
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Built with ❤️ using caffeine.ai
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
