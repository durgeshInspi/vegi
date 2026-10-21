import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Supplier, SupplierType, PaymentRecord, PaymentMethod } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export async function getSuppliers(): Promise<Supplier[]> {
  const db = await getDb();
  return db.collection<Supplier>("suppliers").find({}).sort({ name: 1 }).toArray();
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Supplier>("suppliers").findOne({ _id: objectId });
}

export async function createSupplier(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: SupplierType;
  openingBalance?: number;
  notes?: string;
}): Promise<Supplier> {
  const db = await getDb();

  const openingBalance = Number(data.openingBalance || 0);
  const newSupplier: Supplier = {
    _id: new ObjectId(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    type: data.type,
    openingBalance,
    currentBalance: openingBalance,
    notes: data.notes?.trim() || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection<Supplier>("suppliers").insertOne(newSupplier);
  return newSupplier;
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, "_id" | "createdAt" | "currentBalance">>
): Promise<Supplier | null> {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Supplier ID");

  const db = await getDb();
  const updateDoc: any = { updatedAt: new Date() };

  if (data.name) updateDoc.name = data.name.trim();
  if (data.phone) updateDoc.phone = data.phone.trim();
  if (data.email !== undefined) updateDoc.email = data.email?.trim();
  if (data.address !== undefined) updateDoc.address = data.address?.trim();
  if (data.type) updateDoc.type = data.type;
  if (data.notes !== undefined) updateDoc.notes = data.notes?.trim();

  const result = await db.collection<Supplier>("suppliers").findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result;
}

export async function recordSupplierPayment(
  supplierId: string,
  payment: {
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceInvoice?: string;
    userId: string;
    userName: string;
  }
) {
  const objectId = safeObjectId(supplierId);
  if (!objectId) throw new Error("Invalid Supplier ID");

  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const db = await getDb();
  const supplier = await db.collection<Supplier>("suppliers").findOne({ _id: objectId });
  if (!supplier) throw new Error("Supplier not found");

  // Record payment in payments collection
  const paymentRecord: PaymentRecord = {
    _id: new ObjectId(),
    type: "SUPPLIER_PAYMENT",
    entityId: objectId,
    entityName: supplier.name,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    referenceInvoice: payment.referenceInvoice,
    notes: payment.notes,
    recordedBy: safeObjectId(payment.userId) || new ObjectId(),
    recorderName: payment.userName,
    date: new Date(),
    createdAt: new Date(),
  };

  await db.collection<PaymentRecord>("payments").insertOne(paymentRecord);

  // Reduce supplier's outstanding balance
  await db.collection("suppliers").updateOne(
    { _id: objectId },
    {
      $inc: { currentBalance: -payment.amount },
      $set: { updatedAt: new Date() },
    }
  );

  return paymentRecord;
}
