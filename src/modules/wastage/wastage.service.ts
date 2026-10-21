import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Wastage, WastageReason, StockMovement, UnitType, Vegetable } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export interface RecordWastageInput {
  vegetableId: string;
  quantity: number;
  reason: WastageReason;
  notes?: string;
  date?: string | Date;
}

export async function getWastage(params: {
  vegetableId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
} = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 30));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (params.vegetableId) {
    const vId = safeObjectId(params.vegetableId);
    if (vId) filter.vegetableId = vId;
  }
  if (params.dateFrom || params.dateTo) {
    filter.date = {};
    if (params.dateFrom) filter.date.$gte = new Date(params.dateFrom);
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filter.date.$lte = toDate;
    }
  }

  const [items, totalCount] = await Promise.all([
    db
      .collection<Wastage>("wastage")
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("wastage").countDocuments(filter),
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

export async function recordWastage(
  input: RecordWastageInput,
  userId: string,
  userName: string
): Promise<Wastage> {
  const db = await getDb();
  const vegId = safeObjectId(input.vegetableId);
  if (!vegId) throw new Error("Invalid Vegetable selected.");

  const veg = await db.collection<Vegetable>("vegetables").findOne({ _id: vegId });
  if (!veg) throw new Error("Vegetable not found.");

  const qty = Number(input.quantity);
  if (qty <= 0) throw new Error("Wastage quantity must be greater than zero.");

  if (veg.stockQuantity < qty) {
    throw new Error(
      `Cannot record wastage of ${qty} ${veg.unit}. Current stock is only ${veg.stockQuantity} ${veg.unit}.`
    );
  }

  // Cost basis is the purchase unit cost
  const costBasis = veg.purchasePrice;
  const totalLossValue = Math.round(qty * costBasis * 100) / 100;
  const wastageDate = input.date ? new Date(input.date) : new Date();
  const userObjId = safeObjectId(userId) || new ObjectId();

  const newWastage: Wastage = {
    _id: new ObjectId(),
    vegetableId: veg._id,
    vegetableName: veg.name,
    quantity: qty,
    unit: veg.unit,
    costBasis,
    totalLossValue,
    reason: input.reason,
    notes: input.notes?.trim() || undefined,
    recordedBy: userObjId,
    recorderName: userName,
    date: wastageDate,
    createdAt: new Date(),
  };

  // Deduct stock atomically
  await db.collection("vegetables").updateOne(
    { _id: veg._id },
    { $inc: { stockQuantity: -qty }, $set: { updatedAt: new Date() } }
  );

  // Insert wastage document
  await db.collection<Wastage>("wastage").insertOne(newWastage);

  // Record in stock movements
  await db.collection<StockMovement>("stock_movements").insertOne({
    _id: new ObjectId(),
    vegetableId: veg._id,
    vegetableName: veg.name,
    movementType: "WASTAGE",
    quantity: -qty,
    unit: veg.unit,
    previousStock: veg.stockQuantity,
    newStock: veg.stockQuantity - qty,
    referenceId: newWastage._id,
    reason: `Wastage (${input.reason}): ${input.notes || "Spoilage recorded"}`,
    userId: userObjId,
    userName,
    createdAt: new Date(),
  });

  return newWastage;
}
