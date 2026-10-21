import { ObjectId } from "mongodb";
import { getDb, supportsTransactions } from "@/lib/mongodb";
import { Purchase, PurchaseItem, StockMovement, PaymentStatus, UnitType } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";
import { generatePurchaseInvoiceNumber } from "@/lib/counter";

export interface CreatePurchaseInput {
  supplierId: string;
  purchaseDate?: string | Date;
  items: {
    vegetableId: string;
    quantity: number;
    purchasePrice: number;
    unit: UnitType;
  }[];
  discount?: number;
  transportCharges?: number;
  amountPaid?: number;
  paymentMethod?: string;
  notes?: string;
}

export async function getPurchases(params: {
  supplierId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 30));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (params.supplierId) {
    const sId = safeObjectId(params.supplierId);
    if (sId) filter.supplierId = sId;
  }
  if (params.dateFrom || params.dateTo) {
    filter.purchaseDate = {};
    if (params.dateFrom) filter.purchaseDate.$gte = new Date(params.dateFrom);
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filter.purchaseDate.$lte = toDate;
    }
  }

  const [items, totalCount] = await Promise.all([
    db
      .collection<Purchase>("purchases")
      .find(filter)
      .sort({ purchaseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("purchases").countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getPurchaseById(id: string): Promise<Purchase | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Purchase>("purchases").findOne({ _id: objectId });
}

export async function createPurchase(
  input: CreatePurchaseInput,
  userId: string,
  userName: string
): Promise<Purchase> {
  const db = await getDb();
  const supplierId = safeObjectId(input.supplierId);
  if (!supplierId) throw new Error("Invalid Supplier selected.");

  const supplier = await db.collection("suppliers").findOne({ _id: supplierId });
  if (!supplier) throw new Error("Supplier not found.");

  if (!input.items || input.items.length === 0) {
    throw new Error("Purchase must contain at least one item.");
  }

  // Validate items and recalculate totals server-side
  const validatedItems: PurchaseItem[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const vegId = safeObjectId(item.vegetableId);
    if (!vegId) throw new Error("Invalid Vegetable ID in purchase items.");

    const veg = await db.collection("vegetables").findOne({ _id: vegId });
    if (!veg) throw new Error(`Vegetable with ID ${item.vegetableId} not found.`);

    const quantity = Number(item.quantity);
    const purchasePrice = Number(item.purchasePrice);

    if (quantity <= 0) throw new Error(`Quantity for ${veg.name} must be greater than zero.`);
    if (purchasePrice < 0) throw new Error(`Price for ${veg.name} cannot be negative.`);

    const lineTotal = Math.round(quantity * purchasePrice * 100) / 100;
    subtotal += lineTotal;

    validatedItems.push({
      vegetableId: vegId,
      vegetableName: veg.name,
      quantity,
      unit: item.unit || veg.unit,
      purchasePrice,
      lineTotal,
    });
  }

  const discount = Math.max(0, Number(input.discount || 0));
  const transportCharges = Math.max(0, Number(input.transportCharges || 0));
  const totalAmount = Math.max(0, subtotal - discount + transportCharges);
  const amountPaid = Math.max(0, Number(input.amountPaid || 0));
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  let paymentStatus: PaymentStatus = "UNPAID";
  if (amountPaid >= totalAmount) {
    paymentStatus = "PAID";
  } else if (amountPaid > 0) {
    paymentStatus = "PARTIAL";
  }

  const invoiceNumber = await generatePurchaseInvoiceNumber(db);
  const userObjId = safeObjectId(userId) || new ObjectId();
  const purchaseDate = input.purchaseDate ? new Date(input.purchaseDate) : new Date();

  const newPurchase: Purchase = {
    _id: new ObjectId(),
    invoiceNumber,
    supplierId,
    supplierName: supplier.name,
    purchaseDate,
    items: validatedItems,
    subtotal,
    discount,
    transportCharges,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentStatus,
    paymentMethod: input.paymentMethod || "CASH",
    notes: input.notes?.trim() || undefined,
    status: "RECEIVED",
    createdBy: userObjId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Perform multi-document update
  await db.collection<Purchase>("purchases").insertOne(newPurchase);

  // Update inventory and stock movements for each item
  for (const item of validatedItems) {
    const vegBefore = await db.collection("vegetables").findOne({ _id: item.vegetableId });
    const prevStock = vegBefore?.stockQuantity ?? 0;
    const newStock = prevStock + item.quantity;

    await db.collection("vegetables").updateOne(
      { _id: item.vegetableId },
      {
        $inc: { stockQuantity: item.quantity },
        $set: {
          purchasePrice: item.purchasePrice, // update latest cost
          updatedAt: new Date(),
        },
      }
    );

    await db.collection<StockMovement>("stock_movements").insertOne({
      _id: new ObjectId(),
      vegetableId: item.vegetableId,
      vegetableName: item.vegetableName,
      movementType: "PURCHASE_RECEIPT",
      quantity: item.quantity,
      unit: item.unit,
      previousStock: prevStock,
      newStock,
      referenceId: newPurchase._id,
      referenceInvoice: invoiceNumber,
      reason: `Received purchase invoice ${invoiceNumber} from ${supplier.name}`,
      userId: userObjId,
      userName,
      createdAt: new Date(),
    });
  }

  // Update supplier outstanding balance if credit/partial
  if (balanceDue > 0) {
    await db.collection("suppliers").updateOne(
      { _id: supplierId },
      {
        $inc: { currentBalance: balanceDue },
        $set: { updatedAt: new Date() },
      }
    );
  }

  return newPurchase;
}
