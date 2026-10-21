import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Customer, PaymentRecord, PaymentMethod } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export async function getCustomers(): Promise<Customer[]> {
  const db = await getDb();
  return db.collection<Customer>("customers").find({}).sort({ name: 1 }).toArray();
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Customer>("customers").findOne({ _id: objectId });
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit?: number;
}): Promise<Customer> {
  const db = await getDb();

  const newCustomer: Customer = {
    _id: new ObjectId(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    creditLimit: Number(data.creditLimit || 0),
    outstandingBalance: 0,
    isWalkIn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection<Customer>("customers").insertOne(newCustomer);
  return newCustomer;
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "_id" | "createdAt" | "outstandingBalance">>
): Promise<Customer | null> {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Customer ID");

  const db = await getDb();
  const updateDoc: any = { updatedAt: new Date() };

  if (data.name) updateDoc.name = data.name.trim();
  if (data.phone) updateDoc.phone = data.phone.trim();
  if (data.email !== undefined) updateDoc.email = data.email?.trim();
  if (data.address !== undefined) updateDoc.address = data.address?.trim();
  if (data.creditLimit !== undefined) updateDoc.creditLimit = Number(data.creditLimit);

  const result = await db.collection<Customer>("customers").findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result;
}

export async function recordCustomerPayment(
  customerId: string,
  payment: {
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceInvoice?: string;
    userId: string;
    userName: string;
  }
) {
  const objectId = safeObjectId(customerId);
  if (!objectId) throw new Error("Invalid Customer ID");

  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const db = await getDb();
  const customer = await db.collection<Customer>("customers").findOne({ _id: objectId });
  if (!customer) throw new Error("Customer not found");

  // Record payment
  const paymentRecord: PaymentRecord = {
    _id: new ObjectId(),
    type: "CUSTOMER_PAYMENT",
    entityId: objectId,
    entityName: customer.name,
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

  // Deduct from customer's outstanding balance
  await db.collection("customers").updateOne(
    { _id: objectId },
    {
      $inc: { outstandingBalance: -payment.amount },
      $set: { updatedAt: new Date() },
    }
  );

  return paymentRecord;
}
