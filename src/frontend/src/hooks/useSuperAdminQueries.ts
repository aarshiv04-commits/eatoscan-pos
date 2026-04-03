import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuditLog,
  PlatformStats,
  Tenant,
  TenantInput,
  TenantNotification,
} from "../backend.d";
import { useActor } from "./useActor";

// Sample data for when backend is not yet available
const MOCK_TENANTS: Tenant[] = [
  {
    id: 1n,
    businessName: "Spice Garden Restaurant",
    ownerName: "Rajesh Kumar",
    email: "rajesh@spicegarden.com",
    phone: "+91-9876543210",
    plan: "pro" as any,
    status: "active" as any,
    joinedAt: BigInt(Date.now() - 90 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 3n,
    monthlyRevenue: 2400n,
    city: "Mumbai",
    country: "India",
  },
  {
    id: 2n,
    businessName: "The Burger Joint",
    ownerName: "Sarah Thompson",
    email: "sarah@burgerjoint.com",
    phone: "+1-555-234-5678",
    plan: "starter" as any,
    status: "active" as any,
    joinedAt: BigInt(Date.now() - 60 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 1n,
    monthlyRevenue: 580n,
    city: "New York",
    country: "USA",
  },
  {
    id: 3n,
    businessName: "Casa Italiana",
    ownerName: "Marco Rossi",
    email: "marco@casaitaliana.it",
    phone: "+39-06-1234567",
    plan: "enterprise" as any,
    status: "active" as any,
    joinedAt: BigInt(Date.now() - 180 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 12n,
    monthlyRevenue: 8900n,
    city: "Rome",
    country: "Italy",
  },
  {
    id: 4n,
    businessName: "Tokyo Ramen House",
    ownerName: "Yuki Tanaka",
    email: "yuki@tokyoramen.jp",
    phone: "+81-3-1234-5678",
    plan: "pro" as any,
    status: "trial" as any,
    joinedAt: BigInt(Date.now() - 15 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 2n,
    monthlyRevenue: 0n,
    city: "Tokyo",
    country: "Japan",
  },
  {
    id: 5n,
    businessName: "Mango Tree Cafe",
    ownerName: "Priya Sharma",
    email: "priya@mangotree.in",
    phone: "+91-8765432109",
    plan: "starter" as any,
    status: "suspended" as any,
    joinedAt: BigInt(Date.now() - 45 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 1n,
    monthlyRevenue: 290n,
    city: "Bangalore",
    country: "India",
  },
  {
    id: 6n,
    businessName: "Le Petit Bistro",
    ownerName: "Claire Dubois",
    email: "claire@lepetitbistro.fr",
    phone: "+33-1-23456789",
    plan: "enterprise" as any,
    status: "active" as any,
    joinedAt: BigInt(Date.now() - 200 * 24 * 60 * 60 * 1000) * 1_000_000n,
    outletCount: 7n,
    monthlyRevenue: 6500n,
    city: "Paris",
    country: "France",
  },
];

const MOCK_STATS: PlatformStats = {
  totalTenants: 6n,
  activeTenants: 4n,
  suspendedTenants: 1n,
  trialTenants: 1n,
  totalMonthlyRevenue: 18670n,
};

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1n,
    action: "CREATE",
    description: "New tenant onboarded: Le Petit Bistro (Enterprise plan)",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 2 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 2n,
    action: "SUSPEND",
    description: "Tenant suspended due to payment failure: Mango Tree Cafe",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 5 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 3n,
    action: "UPDATE",
    description: "Plan upgrade: The Burger Joint changed from Starter to Pro",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 24 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 4n,
    action: "CREATE",
    description: "New trial started: Tokyo Ramen House",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 30 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 5n,
    action: "ACTIVATE",
    description:
      "Tenant reactivated after payment resolved: Spice Garden Restaurant",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 48 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 6n,
    action: "DELETE",
    description: "Tenant account closed by request: Old Spice Diner",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 72 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    id: 7n,
    action: "UPDATE",
    description: "Outlet count updated: Casa Italiana expanded to 12 outlets",
    actorPrincipal: { toText: () => "aaaaa-aa" } as any,
    timestamp: BigInt(Date.now() - 96 * 60 * 60 * 1000) * 1_000_000n,
  },
];

export function useGetAllTenants() {
  const { actor, isFetching } = useActor();
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      if (!actor) return MOCK_TENANTS;
      try {
        const result = await (actor as any).getAllTenants();
        return result && result.length > 0 ? result : MOCK_TENANTS;
      } catch {
        return MOCK_TENANTS;
      }
    },
    enabled: !isFetching,
    placeholderData: MOCK_TENANTS,
  });
}

export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformStats>({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor) return MOCK_STATS;
      try {
        const result = await (actor as any).getPlatformStats();
        return result ?? MOCK_STATS;
      } catch {
        return MOCK_STATS;
      }
    },
    enabled: !isFetching,
    placeholderData: MOCK_STATS,
  });
}

export function useGetAuditLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<AuditLog[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      if (!actor) return MOCK_AUDIT_LOGS;
      try {
        const result = await (actor as any).getAuditLogs();
        return result && result.length > 0 ? result : MOCK_AUDIT_LOGS;
      } catch {
        return MOCK_AUDIT_LOGS;
      }
    },
    enabled: !isFetching,
    placeholderData: MOCK_AUDIT_LOGS,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const notificationsQuery = useQuery<TenantNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const lastReadTs: bigint = await (
          actor as any
        ).getMyLastReadTimestamp();
        const notifications = await (actor as any).getNewTenantNotifications(
          lastReadTs ?? 0n,
        );
        return notifications ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await (actor as any).markNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return {
    notifications,
    unreadCount,
    markAsRead: markReadMutation.mutate,
    isLoading: notificationsQuery.isLoading,
  };
}

export function useCreateTenant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TenantInput) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createTenant(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["platformStats"] });
      qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}

export function useUpdateTenant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: TenantInput }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateTenant(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}

export function useSuspendTenant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).suspendTenant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["platformStats"] });
      qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}

export function useActivateTenant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).activateTenant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["platformStats"] });
      qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}

export function useDeleteTenant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteTenant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["platformStats"] });
      qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}
