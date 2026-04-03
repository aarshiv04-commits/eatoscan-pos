import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { SuperAdminLayout } from "./components/SuperAdminLayout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import Kitchen from "./pages/Kitchen";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Tables from "./pages/Tables";
import AuditLogPage from "./pages/superadmin/AuditLog";
import Clients from "./pages/superadmin/Clients";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminSettings from "./pages/superadmin/Settings";

function AuthenticatedApp() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Skip admin check if on register page or no identity
    if (location.pathname === "/register" || !identity || !actor || isFetching)
      return;
    setCheckingAdmin(true);
    actor
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setCheckingAdmin(false);
      });
  }, [identity, actor, isFetching, location.pathname]);

  // Allow /register to render without auth gating
  if (location.pathname === "/register") {
    return <Register />;
  }

  if (isInitializing || (identity && (isFetching || checkingAdmin))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-48 h-3" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return <Login />;
  }

  // Super admin gets the super admin panel exclusively
  if (isAdmin) {
    return <SuperAdminLayout />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AuthenticatedApp />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// POS routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const tablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tables",
  component: Tables,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/menu",
  component: Menu,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: Orders,
});

const kitchenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kitchen",
  component: Kitchen,
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: Billing,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

// Register route — publicly accessible
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

// Super Admin routes
const superAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin",
  component: SuperAdminDashboard,
});

const superAdminClientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin/clients",
  component: Clients,
});

const superAdminAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin/audit",
  component: AuditLogPage,
});

const superAdminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin/settings",
  component: SuperAdminSettings,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  tablesRoute,
  menuRoute,
  ordersRoute,
  kitchenRoute,
  billingRoute,
  reportsRoute,
  settingsRoute,
  registerRoute,
  superAdminRoute,
  superAdminClientsRoute,
  superAdminAuditRoute,
  superAdminSettingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
