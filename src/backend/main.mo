import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // ======== AUTHORIZATION SETUP ========
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ======== USER PROFILE MANAGEMENT ========
  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  private func isManager(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.role == "manager" or profile.role == "admin";
      };
    };
  };

  private func isWaiter(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.role == "waiter" or profile.role == "manager" or profile.role == "admin";
      };
    };
  };

  // ======== NEW! NOTIFICATION MANAGEMENT ========
  public type TenantNotification = {
    tenant : Tenant;
    unread : Bool;
  };

  let lastReadNotifications = Map.empty<Principal, Time.Time>();

  public shared ({ caller }) func markNotificationsRead() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can mark notifications as read");
    };
    lastReadNotifications.add(caller, Time.now());
  };

  public query ({ caller }) func getMyLastReadTimestamp() : async Time.Time {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (lastReadNotifications.get(caller)) {
      case (null) { 0 };
      case (?timestamp) { timestamp };
    };
  };

  public query ({ caller }) func getNewTenantNotifications(lastSeenTimestamp : Time.Time) : async [TenantNotification] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can view notifications");
    };
    tenants.values().toArray().map(func(tenant) { {
      tenant;
      unread = tenant.joinedAt > lastSeenTimestamp;
    } });
  };

  // ======== SUPER ADMIN / TENANT MANAGEMENT ========

  public type TenantPlan = { #starter; #pro; #enterprise };
  public type TenantStatus = { #active; #suspended; #trial };

  public type Tenant = {
    id : Nat;
    businessName : Text;
    ownerName : Text;
    email : Text;
    phone : Text;
    plan : TenantPlan;
    status : TenantStatus;
    joinedAt : Time.Time;
    outletCount : Nat;
    monthlyRevenue : Nat;
    city : Text;
    country : Text;
  };

  public type TenantInput = {
    businessName : Text;
    ownerName : Text;
    email : Text;
    phone : Text;
    plan : TenantPlan;
    status : TenantStatus;
    outletCount : Nat;
    monthlyRevenue : Nat;
    city : Text;
    country : Text;
  };

  public type RegisterTenantInput = {
    businessName : Text;
    ownerName : Text;
    email : Text;
    phone : Text;
    city : Text;
    country : Text;
  };

  public type AuditLog = {
    id : Nat;
    action : Text;
    description : Text;
    actorPrincipal : Principal;
    timestamp : Time.Time;
  };

  public type PlatformStats = {
    totalTenants : Nat;
    activeTenants : Nat;
    suspendedTenants : Nat;
    trialTenants : Nat;
    totalMonthlyRevenue : Nat;
  };

  var nextTenantId : Nat = 1;
  var nextAuditLogId : Nat = 1;

  let tenants = Map.empty<Nat, Tenant>();
  let auditLogs = Map.empty<Nat, AuditLog>();

  private func addAuditLog(action : Text, description : Text, logActor : Principal) {
    let id = nextAuditLogId;
    nextAuditLogId += 1;
    let log : AuditLog = {
      id;
      action;
      description;
      actorPrincipal = logActor;
      timestamp = Time.now();
    };
    auditLogs.add(id, log);
  };

  // Self-registration: open to any authenticated user
  public shared ({ caller }) func registerTenant(input : RegisterTenantInput) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to register");
    };
    let id = nextTenantId;
    nextTenantId += 1;
    let tenant : Tenant = {
      id;
      businessName = input.businessName;
      ownerName = input.ownerName;
      email = input.email;
      phone = input.phone;
      plan = #starter;
      status = #trial;
      joinedAt = Time.now();
      outletCount = 1;
      monthlyRevenue = 0;
      city = input.city;
      country = input.country;
    };
    tenants.add(id, tenant);
    addAuditLog("REGISTER_TENANT", "Self-registered tenant: " # input.businessName # " by " # input.ownerName, caller);
    id;
  };

  public shared ({ caller }) func createTenant(input : TenantInput) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can manage tenants");
    };
    let id = nextTenantId;
    nextTenantId += 1;
    let tenant : Tenant = {
      id;
      businessName = input.businessName;
      ownerName = input.ownerName;
      email = input.email;
      phone = input.phone;
      plan = input.plan;
      status = input.status;
      joinedAt = Time.now();
      outletCount = input.outletCount;
      monthlyRevenue = input.monthlyRevenue;
      city = input.city;
      country = input.country;
    };
    tenants.add(id, tenant);
    addAuditLog("CREATE_TENANT", "Created tenant: " # input.businessName, caller);
    id;
  };

  public shared ({ caller }) func updateTenant(id : Nat, input : TenantInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can manage tenants");
    };
    switch (tenants.get(id)) {
      case (null) { Runtime.trap("Tenant not found") };
      case (?existing) {
        let updated : Tenant = {
          id = existing.id;
          businessName = input.businessName;
          ownerName = input.ownerName;
          email = input.email;
          phone = input.phone;
          plan = input.plan;
          status = input.status;
          joinedAt = existing.joinedAt;
          outletCount = input.outletCount;
          monthlyRevenue = input.monthlyRevenue;
          city = input.city;
          country = input.country;
        };
        tenants.add(id, updated);
        addAuditLog("UPDATE_TENANT", "Updated tenant: " # input.businessName, caller);
      };
    };
  };

  public shared ({ caller }) func suspendTenant(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can manage tenants");
    };
    switch (tenants.get(id)) {
      case (null) { Runtime.trap("Tenant not found") };
      case (?existing) {
        let updated : Tenant = {
          id = existing.id;
          businessName = existing.businessName;
          ownerName = existing.ownerName;
          email = existing.email;
          phone = existing.phone;
          plan = existing.plan;
          status = #suspended;
          joinedAt = existing.joinedAt;
          outletCount = existing.outletCount;
          monthlyRevenue = existing.monthlyRevenue;
          city = existing.city;
          country = existing.country;
        };
        tenants.add(id, updated);
        addAuditLog("SUSPEND_TENANT", "Suspended tenant: " # existing.businessName, caller);
      };
    };
  };

  public shared ({ caller }) func activateTenant(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can manage tenants");
    };
    switch (tenants.get(id)) {
      case (null) { Runtime.trap("Tenant not found") };
      case (?existing) {
        let updated : Tenant = {
          id = existing.id;
          businessName = existing.businessName;
          ownerName = existing.ownerName;
          email = existing.email;
          phone = existing.phone;
          plan = existing.plan;
          status = #active;
          joinedAt = existing.joinedAt;
          outletCount = existing.outletCount;
          monthlyRevenue = existing.monthlyRevenue;
          city = existing.city;
          country = existing.country;
        };
        tenants.add(id, updated);
        addAuditLog("ACTIVATE_TENANT", "Activated tenant: " # existing.businessName, caller);
      };
    };
  };

  public shared ({ caller }) func deleteTenant(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can manage tenants");
    };
    switch (tenants.get(id)) {
      case (null) { Runtime.trap("Tenant not found") };
      case (?existing) {
        tenants.remove(id);
        addAuditLog("DELETE_TENANT", "Deleted tenant: " # existing.businessName, caller);
      };
    };
  };

  public query ({ caller }) func getAllTenants() : async [Tenant] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can view tenants");
    };
    tenants.values().toArray();
  };

  public query ({ caller }) func getTenantById(id : Nat) : async ?Tenant {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can view tenants");
    };
    tenants.get(id);
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can view platform stats");
    };
    var totalTenants = 0;
    var activeTenants = 0;
    var suspendedTenants = 0;
    var trialTenants = 0;
    var totalMonthlyRevenue = 0;
    for (tenant in tenants.values()) {
      totalTenants += 1;
      totalMonthlyRevenue += tenant.monthlyRevenue;
      switch (tenant.status) {
        case (#active) { activeTenants += 1 };
        case (#suspended) { suspendedTenants += 1 };
        case (#trial) { trialTenants += 1 };
      };
    };
    {
      totalTenants;
      activeTenants;
      suspendedTenants;
      trialTenants;
      totalMonthlyRevenue;
    };
  };

  public query ({ caller }) func getAuditLogs() : async [AuditLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only super admin can view audit logs");
    };
    auditLogs.values().toArray();
  };

  // ======== TABLE MANAGEMENT ========
  type TableStatus = { #available; #occupied; #reserved };
  type TableId = Nat;

  type RestaurantTable = {
    id : TableId;
    name : Text;
    capacity : Nat;
    status : TableStatus;
    currentOrderId : ?OrderId;
    qrCode : Text;
  };

  module TableComparisons {
    public func compareByRestaurantTableId(table1 : RestaurantTable, table2 : RestaurantTable) : Order.Order {
      Nat.compare(table1.id, table2.id);
    };
  };

  type MenuCategoryId = Nat;

  type MenuCategory = {
    id : MenuCategoryId;
    name : Text;
    description : Text;
    sortOrder : Nat;
  };

  module MenuCategory {
    public func compare(category1 : MenuCategory, category2 : MenuCategory) : Order.Order {
      Nat.compare(category1.id, category2.id);
    };
  };

  type MenuItemId = Nat;
  type Price = Nat;

  type MenuItem = {
    id : MenuItemId;
    categoryId : MenuCategoryId;
    name : Text;
    description : Text;
    price : Price;
    image : ?Storage.ExternalBlob;
    isAvailable : Bool;
    isVeg : Bool;
  };

  module MenuItemComparisons {
    public func compareByMenuItemId(item1 : MenuItem, item2 : MenuItem) : Order.Order {
      Nat.compare(item1.id, item2.id);
    };
  };

  type OrderId = Nat;

  type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #served;
    #completed;
    #cancelled;
  };

  type OrderItem = {
    menuItemId : MenuItemId;
    name : Text;
    price : Price;
    quantity : Nat;
    notes : Text;
  };

  type Order = {
    id : OrderId;
    tableId : TableId;
    staffId : Principal;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    items : [OrderItem];
    totalAmount : Price;
    notes : Text;
  };

  type Bill = {
    order : Order;
    subtotal : Price;
    tax : Price;
    grandTotal : Price;
  };

  var nextTableId : TableId = 1;
  var nextCategoryId : MenuCategoryId = 1;
  var nextMenuItemId : MenuItemId = 1;
  var nextOrderId : OrderId = 1;

  let tables = Map.empty<TableId, RestaurantTable>();
  let categories = Map.empty<MenuCategoryId, MenuCategory>();
  let menuItems = Map.empty<MenuItemId, MenuItem>();
  let orders = Map.empty<OrderId, Order>();

  include MixinStorage();

  public type TableInput = {
    name : Text;
    capacity : Nat;
    qrCode : Text;
  };

  public shared ({ caller }) func createTable(input : TableInput) : async TableId {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can create tables");
    };
    let id = nextTableId;
    nextTableId += 1;
    let table : RestaurantTable = {
      id;
      name = input.name;
      capacity = input.capacity;
      status = #available;
      currentOrderId = null;
      qrCode = input.qrCode;
    };
    tables.add(id, table);
    id;
  };

  public shared ({ caller }) func updateTable(id : TableId, input : TableInput) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can update tables");
    };
    switch (tables.get(id)) {
      case (null) { Runtime.trap("Table not found") };
      case (?existing) {
        let updated : RestaurantTable = {
          id = existing.id;
          name = input.name;
          capacity = input.capacity;
          status = existing.status;
          currentOrderId = existing.currentOrderId;
          qrCode = input.qrCode;
        };
        tables.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTable(id : TableId) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can delete tables");
    };
    tables.remove(id);
  };

  public shared ({ caller }) func updateTableStatus(id : TableId, status : TableStatus) : async () {
    if (not isWaiter(caller)) {
      Runtime.trap("Unauthorized: Only staff can update table status");
    };
    switch (tables.get(id)) {
      case (null) { Runtime.trap("Table not found") };
      case (?table) {
        let updated : RestaurantTable = {
          id = table.id;
          name = table.name;
          capacity = table.capacity;
          status;
          currentOrderId = table.currentOrderId;
          qrCode = table.qrCode;
        };
        tables.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getAllTables() : async [RestaurantTable] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view tables");
    };
    tables.values().toArray().sort(TableComparisons.compareByRestaurantTableId);
  };

  public query ({ caller }) func getTableById(id : TableId) : async ?RestaurantTable {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view tables");
    };
    tables.get(id);
  };

  // ======== MENU MANAGEMENT ========

  public shared ({ caller }) func createCategory(name : Text, description : Text, sortOrder : Nat) : async MenuCategoryId {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can create categories");
    };
    let id = nextCategoryId;
    nextCategoryId += 1;
    let category : MenuCategory = { id; name; description; sortOrder };
    categories.add(id, category);
    id;
  };

  public shared ({ caller }) func updateCategory(id : MenuCategoryId, name : Text, description : Text, sortOrder : Nat) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can update categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?existing) {
        categories.add(id, { id = existing.id; name; description; sortOrder });
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : MenuCategoryId) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can delete categories");
    };
    categories.remove(id);
  };

  public query func getAllCategories() : async [MenuCategory] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func createMenuItem(categoryId : Nat, name : Text, description : Text, price : Price, image : ?Storage.ExternalBlob, isAvailable : Bool, isVeg : Bool) : async MenuItemId {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can create menu items");
    };
    if (categories.get(categoryId) == null) {
      Runtime.trap("Category not found");
    };
    let id = nextMenuItemId;
    nextMenuItemId += 1;
    let item : MenuItem = { id; categoryId; name; description; price; image; isAvailable; isVeg };
    menuItems.add(id, item);
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : MenuItemId, categoryId : Nat, name : Text, description : Text, price : Price, image : ?Storage.ExternalBlob, isAvailable : Bool, isVeg : Bool) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can update menu items");
    };
    if (categories.get(categoryId) == null) {
      Runtime.trap("Category not found");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?existing) {
        menuItems.add(id, { id = existing.id; categoryId; name; description; price; image; isAvailable; isVeg });
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : MenuItemId) : async () {
    if (not isManager(caller)) {
      Runtime.trap("Unauthorized: Only managers can delete menu items");
    };
    menuItems.remove(id);
  };

  public query func getAllMenuItems() : async [MenuItem] {
    menuItems.values().toArray().sort(MenuItemComparisons.compareByMenuItemId);
  };

  public query func getMenuItemsByCategory(categoryId : MenuCategoryId) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.categoryId == categoryId });
  };

  // ======== ORDER MANAGEMENT ========

  public shared ({ caller }) func createOrder(tableId : TableId, _items : [OrderItem], notes : Text) : async OrderId {
    if (not isWaiter(caller)) {
      Runtime.trap("Unauthorized: Only waiters can create orders");
    };
    switch (tables.get(tableId)) {
      case (null) { Runtime.trap("Table not found") };
      case (?table) {
        if (table.status != #available) {
          Runtime.trap("Table not available");
        };
        let id = nextOrderId;
        nextOrderId += 1;
        let order : Order = {
          id; tableId; staffId = caller; status = #pending;
          createdAt = Time.now(); updatedAt = Time.now();
          items = []; totalAmount = 0; notes;
        };
        orders.add(id, order);
        let updatedTable : RestaurantTable = {
          id = table.id; name = table.name; capacity = table.capacity;
          status = #occupied; currentOrderId = ?id; qrCode = table.qrCode;
        };
        tables.add(tableId, updatedTable);
        id;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.staffId != caller and not isManager(caller)) {
          Runtime.trap("Unauthorized: Only order creator or managers can update status");
        };
        orders.add(orderId, {
          id = order.id; tableId = order.tableId; staffId = order.staffId;
          status; createdAt = order.createdAt; updatedAt = Time.now();
          items = order.items; totalAmount = order.totalAmount; notes = order.notes;
        });
      };
    };
  };

  public query ({ caller }) func getOrdersByTable(tableId : TableId) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view orders");
    };
    orders.values().toArray().filter(func(order) { order.tableId == tableId });
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view orders");
    };
    orders.values().toArray().filter(func(order) { order.status == status });
  };

  // ======== BILLING ========

  public query ({ caller }) func getBillForTable(tableId : TableId) : async ?Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view bills");
    };
    switch (tables.get(tableId)) {
      case (null) { null };
      case (?table) {
        switch (table.currentOrderId) {
          case (null) { null };
          case (?orderId) {
            switch (orders.get(orderId)) {
              case (null) { null };
              case (?order) {
                let subtotal = order.totalAmount;
                let taxFloat = (subtotal.toFloat() * 0.05).toInt();
                let tax = if (taxFloat.toNat() > 0 and taxFloat % 100 > 0) {
                  (taxFloat / 100 + 1).toNat() * 100;
                } else {
                  (taxFloat / 100).toNat() * 100;
                };
                let grandTotal = subtotal + tax;
                ?{ order; subtotal; tax; grandTotal };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func markOrderAsPaid(orderId : OrderId) : async () {
    if (not isWaiter(caller)) {
      Runtime.trap("Unauthorized: Only waiters can mark orders as paid");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.staffId != caller and not isManager(caller)) {
          Runtime.trap("Unauthorized: Only order creator or managers can mark as paid");
        };
        orders.add(orderId, {
          id = order.id; tableId = order.tableId; staffId = order.staffId;
          status = #completed; createdAt = order.createdAt; updatedAt = Time.now();
          items = order.items; totalAmount = order.totalAmount; notes = order.notes;
        });
        switch (tables.get(order.tableId)) {
          case (null) {};
          case (?table) {
            tables.add(order.tableId, {
              id = table.id; name = table.name; capacity = table.capacity;
              status = #available; currentOrderId = null; qrCode = table.qrCode;
            });
          };
        };
      };
    };
  };
};
