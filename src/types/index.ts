import { ObjectId } from "mongodb";

export type UserRole = "ADMIN" | "STAFF";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UnitType = "kg" | "gram" | "piece" | "bunch" | "crate";

export interface Vegetable {
  _id: ObjectId;
  name: string;
  sku: string;
  categoryId: ObjectId;
  categoryName?: string; // Denormalized for rapid display
  imageUrl?: string;
  unit: UnitType;
  stockQuantity: number;
  minimumStock: number;
  purchasePrice: number; // In INR
  sellingPrice: number; // In INR
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SupplierType = "FARMER" | "WHOLESALER" | "DISTRIBUTOR";

export interface Supplier {
  _id: ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: SupplierType;
  openingBalance: number;
  currentBalance: number; // Positive = we owe supplier, Negative = advance paid
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  outstandingBalance: number; // Positive = customer owes us
  isWalkIn?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
export type PurchaseStatus = "RECEIVED" | "PENDING" | "CANCELLED";

export interface PurchaseItem {
  vegetableId: ObjectId;
  vegetableName: string;
  quantity: number;
  unit: UnitType;
  purchasePrice: number;
  lineTotal: number;
}

export interface Purchase {
  _id: ObjectId;
  invoiceNumber: string;
  supplierId: ObjectId;
  supplierName: string;
  purchaseDate: Date;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  transportCharges: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  status: PurchaseStatus;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "CREDIT";
export type SaleStatus = "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface SaleItem {
  vegetableId: ObjectId;
  vegetableName: string;
  quantity: number;
  unit: UnitType;
  sellingPrice: number;
  unitCost: number; // Snapshot of cost at sale time for accurate COGS
  lineTotal: number;
}

export interface Sale {
  _id: ObjectId;
  invoiceNumber: string;
  customerId: ObjectId | null;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  cashierId: ObjectId;
  cashierName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StockMovementType =
  | "OPENING"
  | "PURCHASE_RECEIPT"
  | "SALE"
  | "PURCHASE_RETURN"
  | "SALES_RETURN"
  | "WASTAGE"
  | "MANUAL_ADJUSTMENT";

export interface StockMovement {
  _id: ObjectId;
  vegetableId: ObjectId;
  vegetableName: string;
  movementType: StockMovementType;
  quantity: number; // Positive for additions, negative for deductions
  unit: UnitType;
  previousStock: number;
  newStock: number;
  referenceId?: ObjectId;
  referenceInvoice?: string;
  reason: string;
  userId: ObjectId;
  userName: string;
  createdAt: Date;
}

export type WastageReason = "SPOILED" | "DAMAGED" | "EXPIRED" | "QUALITY_LOSS" | "PEST_DAMAGE" | "OTHER";

export interface Wastage {
  _id: ObjectId;
  vegetableId: ObjectId;
  vegetableName: string;
  quantity: number;
  unit: UnitType;
  costBasis: number; // Unit cost at time of wastage
  totalLossValue: number; // quantity * costBasis
  reason: WastageReason;
  notes?: string;
  recordedBy: ObjectId;
  recorderName: string;
  date: Date;
  createdAt: Date;
}

export interface ExpenseCategory {
  _id: ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Expense {
  _id: ObjectId;
  categoryId: ObjectId;
  categoryName: string;
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: Date;
  notes?: string;
  recordedBy: ObjectId;
  recorderName: string;
  createdAt: Date;
}

export interface PaymentRecord {
  _id: ObjectId;
  type: "CUSTOMER_PAYMENT" | "SUPPLIER_PAYMENT";
  entityId: ObjectId;
  entityName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceInvoice?: string;
  notes?: string;
  recordedBy: ObjectId;
  recorderName: string;
  date: Date;
  createdAt: Date;
}

export interface Counter {
  _id: string; // e.g. "sales" or "purchases"
  sequenceValue: number;
}

// Client-safe DTO helper types
export type WithStringId<T> = Omit<T, "_id" | "categoryId" | "supplierId" | "customerId" | "vegetableId" | "referenceId" | "createdBy" | "cashierId" | "recordedBy" | "userId"> & {
  _id: string;
  categoryId?: string;
  supplierId?: string;
  customerId?: string | null;
  vegetableId?: string;
  referenceId?: string;
  createdBy?: string;
  cashierId?: string;
  recordedBy?: string;
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  date?: string | Date;
  purchaseDate?: string | Date;
};
