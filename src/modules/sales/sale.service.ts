import { ObjectId, ClientSession } from "mongodb";
import { getDb, getMongoClient, supportsTransactions } from "@/lib/mongodb";
import { Sale, SaleItem, StockMovement, PaymentMethod, PaymentStatus, UnitType, Vegetable } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";
import { generateSaleInvoiceNumber } from "@/lib/counter";

export interface CreateSaleInput {
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  items: {
    vegetableId: string;
    quantity: number;
    sellingPrice?: number; // Optional override from cashier if authorized, else fetched from DB
    unit: UnitType;
  }[];
  discount?: number;
  amountPaid?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function getSales(params: {
  page?: number;
  limit?: number;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: string;
  searchInvoice?: string;
} = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 30));
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (params.searchInvoice?.trim()) {
    filter.invoiceNumber = { $regex: params.searchInvoice.trim(), $options: "i" };
  }

  if (params.customerId) {
    const cId = safeObjectId(params.customerId);
    if (cId) filter.customerId = cId;
  }

  if (params.paymentStatus && params.paymentStatus !== "ALL") {
    filter.paymentStatus = params.paymentStatus;
  }

  if (params.dateFrom || params.dateTo) {
    filter.createdAt = {};
    if (params.dateFrom) filter.createdAt.$gte = new Date(params.dateFrom);
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  const [items, totalCount] = await Promise.all([
    db
      .collection<Sale>("sales")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("sales").countDocuments(filter),
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

export async function getSaleById(id: string): Promise<Sale | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Sale>("sales").findOne({ _id: objectId });
}

export async function createSale(
  input: CreateSaleInput,
  cashierId: string,
  cashierName: string
): Promise<Sale> {
  const client = await getMongoClient();
  const db = await getDb();
  const hasTx = await supportsTransactions(client);

  if (!input.items || input.items.length === 0) {
    throw new Error("Sale cart cannot be empty.");
  }

  let customerId: ObjectId | null = null;
  let customerName = input.customerName?.trim() || "Walk-in Customer";
  let customerPhone = input.customerPhone?.trim() || undefined;

  if (input.customerId && input.customerId !== "walk-in") {
    const cId = safeObjectId(input.customerId);
    if (cId) {
      const customer = await db.collection("customers").findOne({ _id: cId });
      if (customer) {
        customerId = customer._id;
        customerName = customer.name;
        customerPhone = customer.phone;
      }
    }
  }

  // Pre-validate vegetables and calculate amounts
  const validatedItems: SaleItem[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const vegId = safeObjectId(item.vegetableId);
    if (!vegId) throw new Error("Invalid Vegetable selected in cart.");

    const veg = await db.collection<Vegetable>("vegetables").findOne({ _id: vegId });
    if (!veg || !veg.isActive) {
      throw new Error(`Vegetable "${item.vegetableId}" is not available or inactive.`);
    }

    const qty = Number(item.quantity);
    if (qty <= 0) {
      throw new Error(`Quantity for "${veg.name}" must be greater than zero.`);
    }

    if (veg.stockQuantity < qty) {
      throw new Error(
        `Insufficient stock for "${veg.name}". Available: ${veg.stockQuantity} ${veg.unit}, Requested: ${qty} ${veg.unit}.`
      );
    }

    const sellingPrice =
      item.sellingPrice !== undefined && item.sellingPrice >= 0
        ? Number(item.sellingPrice)
        : veg.sellingPrice;

    const unitCost = veg.purchasePrice; // Capture historical cost basis for COGS
    const lineTotal = Math.round(qty * sellingPrice * 100) / 100;
    subtotal += lineTotal;

    validatedItems.push({
      vegetableId: veg._id,
      vegetableName: veg.name,
      quantity: qty,
      unit: item.unit || veg.unit,
      sellingPrice,
      unitCost,
      lineTotal,
    });
  }

  const discount = Math.max(0, Number(input.discount || 0));
  const totalAmount = Math.max(0, subtotal - discount);
  const paymentMethod = input.paymentMethod || "CASH";

  // If paying via CREDIT, amountPaid is 0 by default unless partial
  let amountPaid =
    paymentMethod === "CREDIT"
      ? Math.max(0, Number(input.amountPaid || 0))
      : input.amountPaid !== undefined
      ? Number(input.amountPaid)
      : totalAmount;

  if (amountPaid > totalAmount) {
    amountPaid = totalAmount; // Cannot overpay
  }

  const balanceDue = Math.max(0, totalAmount - amountPaid);

  let paymentStatus: PaymentStatus = "PAID";
  if (balanceDue === 0) {
    paymentStatus = "PAID";
  } else if (amountPaid > 0) {
    paymentStatus = "PARTIAL";
  } else {
    paymentStatus = "UNPAID";
  }

  if (balanceDue > 0 && !customerId) {
    throw new Error(
      "Customer must be selected or registered for Credit or Partial payment sales."
    );
  }

  const invoiceNumber = await generateSaleInvoiceNumber(db);
  const cashierObjId = safeObjectId(cashierId) || new ObjectId();

  const newSale: Sale = {
    _id: new ObjectId(),
    invoiceNumber,
    customerId,
    customerName,
    customerPhone,
    items: validatedItems,
    subtotal,
    discount,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentMethod,
    paymentStatus,
    status: "COMPLETED",
    cashierId: cashierObjId,
    cashierName,
    notes: input.notes?.trim() || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Execute with Transaction or Safe Atomic Operations with Rollback Compensation
  if (hasTx) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // 1. Atomically deduct stock for each item
        for (const item of validatedItems) {
          const updateRes = await db.collection("vegetables").updateOne(
            { _id: item.vegetableId, stockQuantity: { $gte: item.quantity } },
            { $inc: { stockQuantity: -item.quantity }, $set: { updatedAt: new Date() } },
            { session }
          );
          if (updateRes.matchedCount === 0) {
            throw new Error(`Stock depleted for "${item.vegetableName}" during checkout.`);
          }
        }

        // 2. Insert Sale document
        await db.collection<Sale>("sales").insertOne(newSale, { session });

        // 3. Log stock movements
        const movements: StockMovement[] = validatedItems.map((item) => ({
          _id: new ObjectId(),
          vegetableId: item.vegetableId,
          vegetableName: item.vegetableName,
          movementType: "SALE",
          quantity: -item.quantity,
          unit: item.unit,
          previousStock: 0, // In transaction, current is decremented
          newStock: 0,
          referenceId: newSale._id,
          referenceInvoice: invoiceNumber,
          reason: `Sold on bill ${invoiceNumber}`,
          userId: cashierObjId,
          userName: cashierName,
          createdAt: new Date(),
        }));
        await db.collection<StockMovement>("stock_movements").insertMany(movements, { session });

        // 4. Update customer balance if credit sale
        if (balanceDue > 0 && customerId) {
          await db.collection("customers").updateOne(
            { _id: customerId },
            { $inc: { outstandingBalance: balanceDue }, $set: { updatedAt: new Date() } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  } else {
    // Non-replica set (Standalone MongoDB): Safe Atomic Deduction with Compensation
    const deductedItems: { vegetableId: ObjectId; quantity: number }[] = [];

    try {
      for (const item of validatedItems) {
        // Atomic compare-and-swap update
        const updateRes = await db.collection("vegetables").findOneAndUpdate(
          { _id: item.vegetableId, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity }, $set: { updatedAt: new Date() } },
          { returnDocument: "after" }
        );

        if (!updateRes) {
          throw new Error(
            `Stock conflict: "${item.vegetableName}" does not have enough stock available.`
          );
        }

        deductedItems.push({ vegetableId: item.vegetableId, quantity: item.quantity });
      }

      // Insert Sale
      await db.collection<Sale>("sales").insertOne(newSale);

      // Record Stock Movements
      for (const item of validatedItems) {
        await db.collection<StockMovement>("stock_movements").insertOne({
          _id: new ObjectId(),
          vegetableId: item.vegetableId,
          vegetableName: item.vegetableName,
          movementType: "SALE",
          quantity: -item.quantity,
          unit: item.unit,
          previousStock: 0,
          newStock: 0,
          referenceId: newSale._id,
          referenceInvoice: invoiceNumber,
          reason: `Sold on invoice ${invoiceNumber}`,
          userId: cashierObjId,
          userName: cashierName,
          createdAt: new Date(),
        });
      }

      // Record Customer balance if credit sale
      if (balanceDue > 0 && customerId) {
        await db.collection("customers").updateOne(
          { _id: customerId },
          { $inc: { outstandingBalance: balanceDue }, $set: { updatedAt: new Date() } }
        );
      }
    } catch (err) {
      // Rollback any successfully deducted items if intermediate item failed!
      for (const deducted of deductedItems) {
        await db.collection("vegetables").updateOne(
          { _id: deducted.vegetableId },
          { $inc: { stockQuantity: deducted.quantity } }
        );
      }
      throw err;
    }
  }

  return newSale;
}

export async function cancelSale(
  saleId: string,
  userId: string,
  userName: string,
  reason: string
): Promise<Sale> {
  const objectId = safeObjectId(saleId);
  if (!objectId) throw new Error("Invalid Sale ID");

  const db = await getDb();
  const sale = await db.collection<Sale>("sales").findOne({ _id: objectId });
  if (!sale) throw new Error("Sale not found");

  if (sale.status === "CANCELLED") {
    throw new Error("Sale is already cancelled.");
  }

  // Restore inventory for each item
  for (const item of sale.items) {
    await db.collection("vegetables").updateOne(
      { _id: item.vegetableId },
      { $inc: { stockQuantity: item.quantity }, $set: { updatedAt: new Date() } }
    );

    // Record return movement
    await db.collection<StockMovement>("stock_movements").insertOne({
      _id: new ObjectId(),
      vegetableId: item.vegetableId,
      vegetableName: item.vegetableName,
      movementType: "SALES_RETURN",
      quantity: item.quantity,
      unit: item.unit,
      previousStock: 0,
      newStock: 0,
      referenceId: sale._id,
      referenceInvoice: sale.invoiceNumber,
      reason: `Cancelled bill ${sale.invoiceNumber}: ${reason}`,
      userId: safeObjectId(userId) || new ObjectId(),
      userName,
      createdAt: new Date(),
    });
  }

  // Reverse customer credit balance if applicable
  if (sale.balanceDue > 0 && sale.customerId) {
    await db.collection("customers").updateOne(
      { _id: sale.customerId },
      { $inc: { outstandingBalance: -sale.balanceDue }, $set: { updatedAt: new Date() } }
    );
  }

  // Mark sale as cancelled
  const updated = await db.collection<Sale>("sales").findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        status: "CANCELLED",
        notes: (sale.notes ? `${sale.notes} | ` : "") + `Cancelled: ${reason}`,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return updated!;
}
