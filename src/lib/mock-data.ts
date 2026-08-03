export type UserRole = "admin" | "user";
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  ownerId: string;
  lastUpdated: string;
  status: StockStatus;
}

export interface ActivityEntry {
  id: string;
  message: string;
  timestamp: string;
  type: "add" | "remove" | "alert" | "update";
}

export const inventoryUsers: InventoryUser[] = [
  {
    id: "u-admin",
    name: "Admin User",
    email: "admin@stockflow.io",
    role: "admin",
    avatar: "AU",
    department: "Operations",
  },
  {
    id: "u-elena",
    name: "Elena Liu",
    email: "elena@stockflow.io",
    role: "user",
    avatar: "EL",
    department: "Warehouse A",
  },
  {
    id: "u-marcus",
    name: "Marcus Chen",
    email: "marcus@stockflow.io",
    role: "user",
    avatar: "MC",
    department: "Warehouse B",
  },
  {
    id: "u-sarah",
    name: "Sarah Kim",
    email: "sarah@stockflow.io",
    role: "user",
    avatar: "SK",
    department: "Retail Floor",
  },
  {
    id: "u-james",
    name: "James Wright",
    email: "james@stockflow.io",
    role: "user",
    avatar: "JW",
    department: "Warehouse A",
  },
];

export const inventoryItems: InventoryItem[] = [
  {
    id: "i1",
    name: "Wireless Mouse",
    sku: "WM-2041",
    category: "Electronics",
    quantity: 48,
    minStock: 20,
    unit: "units",
    location: "Shelf A-12",
    ownerId: "u-elena",
    lastUpdated: "2 hours ago",
    status: "in-stock",
  },
  {
    id: "i2",
    name: "USB-C Hub",
    sku: "UH-1180",
    category: "Electronics",
    quantity: 8,
    minStock: 15,
    unit: "units",
    location: "Shelf A-14",
    ownerId: "u-elena",
    lastUpdated: "5 hours ago",
    status: "low-stock",
  },
  {
    id: "i3",
    name: "Office Chair",
    sku: "OC-3302",
    category: "Furniture",
    quantity: 22,
    minStock: 10,
    unit: "units",
    location: "Zone B-03",
    ownerId: "u-marcus",
    lastUpdated: "1 day ago",
    status: "in-stock",
  },
  {
    id: "i4",
    name: "Standing Desk",
    sku: "SD-7701",
    category: "Furniture",
    quantity: 0,
    minStock: 5,
    unit: "units",
    location: "Zone B-05",
    ownerId: "u-marcus",
    lastUpdated: "3 hours ago",
    status: "out-of-stock",
  },
  {
    id: "i5",
    name: "A4 Paper Ream",
    sku: "PR-0092",
    category: "Supplies",
    quantity: 120,
    minStock: 50,
    unit: "reams",
    location: "Supply Room",
    ownerId: "u-sarah",
    lastUpdated: "30 min ago",
    status: "in-stock",
  },
  {
    id: "i6",
    name: "Label Printer",
    sku: "LP-4410",
    category: "Equipment",
    quantity: 6,
    minStock: 8,
    unit: "units",
    location: "Counter 2",
    ownerId: "u-sarah",
    lastUpdated: "4 hours ago",
    status: "low-stock",
  },
  {
    id: "i7",
    name: "Safety Gloves (L)",
    sku: "SG-2200",
    category: "Safety",
    quantity: 200,
    minStock: 100,
    unit: "pairs",
    location: "Safety Cabinet",
    ownerId: "u-james",
    lastUpdated: "6 hours ago",
    status: "in-stock",
  },
  {
    id: "i8",
    name: "Pallet Jack",
    sku: "PJ-1001",
    category: "Equipment",
    quantity: 3,
    minStock: 2,
    unit: "units",
    location: "Loading Dock",
    ownerId: "u-james",
    lastUpdated: "2 days ago",
    status: "in-stock",
  },
  {
    id: "i9",
    name: "HDMI Cable 2m",
    sku: "HC-5500",
    category: "Electronics",
    quantity: 35,
    minStock: 25,
    unit: "units",
    location: "Shelf A-08",
    ownerId: "u-elena",
    lastUpdated: "1 hour ago",
    status: "in-stock",
  },
  {
    id: "i10",
    name: "Storage Bin (Large)",
    sku: "SB-8800",
    category: "Supplies",
    quantity: 14,
    minStock: 20,
    unit: "units",
    location: "Zone C-01",
    ownerId: "u-marcus",
    lastUpdated: "8 hours ago",
    status: "low-stock",
  },
];

export const recentActivity: ActivityEntry[] = [
  {
    id: "a1",
    message: "USB-C Hub dropped below minimum stock",
    timestamp: "5 min ago",
    type: "alert",
  },
  {
    id: "a2",
    message: "Elena added 24× Wireless Mouse",
    timestamp: "2 hours ago",
    type: "add",
  },
  {
    id: "a3",
    message: "Standing Desk marked out of stock",
    timestamp: "3 hours ago",
    type: "alert",
  },
  {
    id: "a4",
    message: "Sarah updated A4 Paper Ream count",
    timestamp: "30 min ago",
    type: "update",
  },
  {
    id: "a5",
    message: "James removed 12× Safety Gloves",
    timestamp: "6 hours ago",
    type: "remove",
  },
];

export function getItemsForUser(userId: string): InventoryItem[] {
  return inventoryItems.filter((item) => item.ownerId === userId);
}

export function getUserById(userId: string): InventoryUser | undefined {
  return inventoryUsers.find((u) => u.id === userId);
}

export function getUserByEmail(email: string): InventoryUser | undefined {
  return inventoryUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function getAdminStats() {
  const totalItems = inventoryItems.length;
  const totalQuantity = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
  const lowStock = inventoryItems.filter(
    (i) => i.status === "low-stock" || i.status === "out-of-stock"
  ).length;
  const categories = new Set(inventoryItems.map((i) => i.category)).size;

  return { totalItems, totalQuantity, lowStock, categories, totalUsers: inventoryUsers.filter(u => u.role === "user").length };
}

export function getUserStats(userId: string) {
  const items = getItemsForUser(userId);
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStock = items.filter(
    (i) => i.status === "low-stock" || i.status === "out-of-stock"
  ).length;
  const categories = new Set(items.map((i) => i.category)).size;

  return { totalItems, totalQuantity, lowStock, categories };
}

export const categoryBreakdown = [
  { category: "Electronics", count: 3 },
  { category: "Furniture", count: 2 },
  { category: "Supplies", count: 2 },
  { category: "Equipment", count: 2 },
  { category: "Safety", count: 1 },
];

export const stockTrend = [
  { month: "Mar", value: 420 },
  { month: "Apr", value: 380 },
  { month: "May", value: 510 },
  { month: "Jun", value: 470 },
  { month: "Jul", value: 530 },
  { month: "Aug", value: 456 },
];
