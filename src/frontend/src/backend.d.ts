import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AuditLog {
    id: bigint;
    action: string;
    description: string;
    timestamp: Time;
    actorPrincipal: Principal;
}
export type Time = bigint;
export interface Tenant {
    id: bigint;
    status: TenantStatus;
    country: string;
    outletCount: bigint;
    ownerName: string;
    city: string;
    plan: TenantPlan;
    joinedAt: Time;
    businessName: string;
    email: string;
    phone: string;
    monthlyRevenue: bigint;
}
export interface TenantInput {
    status: TenantStatus;
    country: string;
    outletCount: bigint;
    ownerName: string;
    city: string;
    plan: TenantPlan;
    businessName: string;
    email: string;
    phone: string;
    monthlyRevenue: bigint;
}
export interface RestaurantTable {
    id: TableId;
    status: TableStatus;
    name: string;
    currentOrderId?: OrderId;
    capacity: bigint;
    qrCode: string;
}
export interface OrderItem {
    name: string;
    notes: string;
    quantity: bigint;
    price: Price;
    menuItemId: MenuItemId;
}
export type MenuItemId = bigint;
export interface TenantNotification {
    unread: boolean;
    tenant: Tenant;
}
export interface TableInput {
    name: string;
    capacity: bigint;
    qrCode: string;
}
export interface PlatformStats {
    suspendedTenants: bigint;
    totalMonthlyRevenue: bigint;
    totalTenants: bigint;
    activeTenants: bigint;
    trialTenants: bigint;
}
export interface MenuCategory {
    id: MenuCategoryId;
    sortOrder: bigint;
    name: string;
    description: string;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    staffId: Principal;
    createdAt: Time;
    tableId: TableId;
    updatedAt: Time;
    totalAmount: Price;
    notes: string;
    items: Array<OrderItem>;
}
export type Price = bigint;
export interface MenuItem {
    id: MenuItemId;
    categoryId: MenuCategoryId;
    name: string;
    isAvailable: boolean;
    description: string;
    image?: ExternalBlob;
    isVeg: boolean;
    price: Price;
}
export type MenuCategoryId = bigint;
export interface Bill {
    tax: Price;
    order: Order;
    grandTotal: Price;
    subtotal: Price;
}
export interface RegisterTenantInput {
    country: string;
    ownerName: string;
    city: string;
    businessName: string;
    email: string;
    phone: string;
}
export type TableId = bigint;
export type OrderId = bigint;
export interface UserProfile {
    name: string;
    role: string;
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    served = "served",
    ready = "ready"
}
export enum TableStatus {
    occupied = "occupied",
    reserved = "reserved",
    available = "available"
}
export enum TenantPlan {
    pro = "pro",
    enterprise = "enterprise",
    starter = "starter"
}
export enum TenantStatus {
    trial = "trial",
    active = "active",
    suspended = "suspended"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateTenant(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, description: string, sortOrder: bigint): Promise<MenuCategoryId>;
    createMenuItem(categoryId: bigint, name: string, description: string, price: Price, image: ExternalBlob | null, isAvailable: boolean, isVeg: boolean): Promise<MenuItemId>;
    createOrder(tableId: TableId, _items: Array<OrderItem>, notes: string): Promise<OrderId>;
    createTable(input: TableInput): Promise<TableId>;
    createTenant(input: TenantInput): Promise<bigint>;
    deleteCategory(id: MenuCategoryId): Promise<void>;
    deleteMenuItem(id: MenuItemId): Promise<void>;
    deleteTable(id: TableId): Promise<void>;
    deleteTenant(id: bigint): Promise<void>;
    getAllCategories(): Promise<Array<MenuCategory>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllTables(): Promise<Array<RestaurantTable>>;
    getAllTenants(): Promise<Array<Tenant>>;
    getAuditLogs(): Promise<Array<AuditLog>>;
    getBillForTable(tableId: TableId): Promise<Bill | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItemsByCategory(categoryId: MenuCategoryId): Promise<Array<MenuItem>>;
    getMyLastReadTimestamp(): Promise<Time>;
    getNewTenantNotifications(lastSeenTimestamp: Time): Promise<Array<TenantNotification>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getOrdersByTable(tableId: TableId): Promise<Array<Order>>;
    getPlatformStats(): Promise<PlatformStats>;
    getTableById(id: TableId): Promise<RestaurantTable | null>;
    getTenantById(id: bigint): Promise<Tenant | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationsRead(): Promise<void>;
    markOrderAsPaid(orderId: OrderId): Promise<void>;
    registerTenant(input: RegisterTenantInput): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    suspendTenant(id: bigint): Promise<void>;
    updateCategory(id: MenuCategoryId, name: string, description: string, sortOrder: bigint): Promise<void>;
    updateMenuItem(id: MenuItemId, categoryId: bigint, name: string, description: string, price: Price, image: ExternalBlob | null, isAvailable: boolean, isVeg: boolean): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateTable(id: TableId, input: TableInput): Promise<void>;
    updateTableStatus(id: TableId, status: TableStatus): Promise<void>;
    updateTenant(id: bigint, input: TenantInput): Promise<void>;
}
