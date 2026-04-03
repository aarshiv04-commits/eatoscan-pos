import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import {
  type Bill,
  type MenuCategory,
  type MenuItem,
  type Order,
  type OrderItem,
  OrderStatus,
  type RestaurantTable,
  type TableInput,
  type TableStatus,
  type UserProfile,
} from "../backend.d";
import {
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_ORDERS,
  MOCK_TABLES,
} from "../data/mockData";
import { useActor } from "./useActor";

// ========================
// TABLES
// ========================
export function useGetAllTables() {
  const { actor, isFetching } = useActor();
  return useQuery<RestaurantTable[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      if (!actor) return MOCK_TABLES;
      const result = await actor.getAllTables();
      return result.length > 0 ? result : MOCK_TABLES;
    },
    enabled: !isFetching,
    placeholderData: MOCK_TABLES,
  });
}

export function useCreateTable() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TableInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTable(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

export function useUpdateTable() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: TableInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTable(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

export function useDeleteTable() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTable(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

export function useUpdateTableStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: TableStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTableStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

// ========================
// CATEGORIES
// ========================
export function useGetAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return MOCK_CATEGORIES;
      const result = await actor.getAllCategories();
      return result.length > 0 ? result : MOCK_CATEGORIES;
    },
    enabled: !isFetching,
    placeholderData: MOCK_CATEGORIES,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      sortOrder,
    }: { name: string; description: string; sortOrder: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCategory(name, description, sortOrder);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      sortOrder,
    }: {
      id: bigint;
      name: string;
      description: string;
      sortOrder: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCategory(id, name, description, sortOrder);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
}

// ========================
// MENU ITEMS
// ========================
export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return MOCK_MENU_ITEMS;
      const result = await actor.getAllMenuItems();
      return result.length > 0 ? result : MOCK_MENU_ITEMS;
    },
    enabled: !isFetching,
    placeholderData: MOCK_MENU_ITEMS,
  });
}

export function useCreateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      categoryId: bigint;
      name: string;
      description: string;
      price: bigint;
      image: ExternalBlob | null;
      isAvailable: boolean;
      isVeg: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMenuItem(
        params.categoryId,
        params.name,
        params.description,
        params.price,
        params.image,
        params.isAvailable,
        params.isVeg,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuItems"] }),
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      categoryId: bigint;
      name: string;
      description: string;
      price: bigint;
      image: ExternalBlob | null;
      isAvailable: boolean;
      isVeg: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMenuItem(
        params.id,
        params.categoryId,
        params.name,
        params.description,
        params.price,
        params.image,
        params.isAvailable,
        params.isVeg,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuItems"] }),
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuItems"] }),
  });
}

// ========================
// ORDERS
// ========================
export function useGetOrdersByStatus(status: OrderStatus) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", status],
    queryFn: async () => {
      if (!actor) return MOCK_ORDERS.filter((o) => o.status === status);
      const result = await actor.getOrdersByStatus(status);
      const fallback = MOCK_ORDERS.filter((o) => o.status === status);
      return result.length > 0 ? result : fallback;
    },
    enabled: !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return MOCK_ORDERS;
      const results = await Promise.all([
        actor.getOrdersByStatus(OrderStatus.pending),
        actor.getOrdersByStatus(OrderStatus.preparing),
        actor.getOrdersByStatus(OrderStatus.ready),
        actor.getOrdersByStatus(OrderStatus.served),
        actor.getOrdersByStatus(OrderStatus.completed),
        actor.getOrdersByStatus(OrderStatus.cancelled),
      ]);
      const all = results.flat();
      return all.length > 0 ? all : MOCK_ORDERS;
    },
    enabled: !isFetching,
    placeholderData: MOCK_ORDERS,
  });
}

export function useGetOrdersByTable(tableId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "table", tableId?.toString()],
    queryFn: async () => {
      if (!actor || !tableId) return [];
      return actor.getOrdersByTable(tableId);
    },
    enabled: !isFetching && !!tableId,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tableId,
      items,
      notes,
    }: { tableId: bigint; items: OrderItem[]; notes: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(tableId, items, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useMarkOrderAsPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markOrderAsPaid(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
      qc.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

// ========================
// BILLING
// ========================
export function useGetBillForTable(tableId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bill | null>({
    queryKey: ["billing", tableId?.toString()],
    queryFn: async () => {
      if (!actor || !tableId) return null;
      return actor.getBillForTable(tableId);
    },
    enabled: !isFetching && !!tableId,
  });
}

// ========================
// USER PROFILE
// ========================
export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
