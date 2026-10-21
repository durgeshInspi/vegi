import { UserRole } from "@/types";

export const PERMISSIONS = {
  // Vegetables & Categories
  MANAGE_VEGETABLES: ["ADMIN"],
  VIEW_VEGETABLES: ["ADMIN", "STAFF"],
  MANAGE_CATEGORIES: ["ADMIN"],

  // Purchases & Suppliers
  CREATE_PURCHASE: ["ADMIN", "STAFF"],
  VIEW_PURCHASES: ["ADMIN", "STAFF"],
  MANAGE_SUPPLIERS: ["ADMIN"],
  VIEW_SUPPLIERS: ["ADMIN", "STAFF"],

  // Sales & POS
  CREATE_SALE: ["ADMIN", "STAFF"],
  VIEW_SALES: ["ADMIN", "STAFF"],
  CANCEL_SALE: ["ADMIN"],
  REFUND_SALE: ["ADMIN"],

  // Customers
  MANAGE_CUSTOMERS: ["ADMIN", "STAFF"],
  VIEW_CUSTOMERS: ["ADMIN", "STAFF"],

  // Inventory & Wastage
  VIEW_INVENTORY: ["ADMIN", "STAFF"],
  ADJUST_INVENTORY: ["ADMIN"],
  RECORD_WASTAGE: ["ADMIN", "STAFF"],
  VIEW_WASTAGE: ["ADMIN", "STAFF"],

  // Expenses & Reports
  MANAGE_EXPENSES: ["ADMIN"],
  VIEW_EXPENSES: ["ADMIN", "STAFF"],
  VIEW_REPORTS: ["ADMIN"],
  VIEW_PROFIT_METRICS: ["ADMIN"],

  // User management
  MANAGE_USERS: ["ADMIN"],
} as const;

export function hasPermission(role: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}
