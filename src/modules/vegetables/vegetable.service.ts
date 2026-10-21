import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Vegetable, StockMovement, UnitType } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export interface GetVegetablesParams {
  query?: string;
  categoryId?: string;
  status?: "all" | "active" | "inactive" | "low_stock" | "out_of_stock";
  page?: number;
  limit?: number;
}

export async function getVegetables(params: GetVegetablesParams = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 50));
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (params.query?.trim()) {
    const q = params.query.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
    ];
  }

  if (params.categoryId && params.categoryId !== "all") {
    const catId = safeObjectId(params.categoryId);
    if (catId) filter.categoryId = catId;
  }

  if (params.status === "active") {
    filter.isActive = true;
  } else if (params.status === "inactive") {
    filter.isActive = false;
  } else if (params.status === "low_stock") {
    filter.$expr = {
      $and: [
        { $lte: ["$stockQuantity", "$minimumStock"] },
        { $gt: ["$stockQuantity", 0] },
      ],
    };
  } else if (params.status === "out_of_stock") {
    filter.stockQuantity = { $lte: 0 };
  }

  const [items, totalCount] = await Promise.all([
    db
      .collection<Vegetable>("vegetables")
      .find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("vegetables").countDocuments(filter),
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

export async function getVegetableById(id: string): Promise<Vegetable | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Vegetable>("vegetables").findOne({ _id: objectId });
}

export async function createVegetable(
  data: {
    name: string;
    sku: string;
    categoryId: string;
    unit: UnitType;
    stockQuantity: number;
    minimumStock: number;
    purchasePrice: number;
    sellingPrice: number;
    imageUrl?: string;
  },
  userId: string,
  userName: string
): Promise<Vegetable> {
  const db = await getDb();
  const categoryId = safeObjectId(data.categoryId);
  if (!categoryId) throw new Error("Invalid Category selected.");

  const category = await db.collection("categories").findOne({ _id: categoryId });
  if (!category) throw new Error("Category not found.");

  const normalizedSku = data.sku.trim().toUpperCase();
  const existingSku = await db.collection("vegetables").findOne({ sku: normalizedSku });
  if (existingSku) {
    throw new Error(`A vegetable with SKU "${normalizedSku}" already exists.`);
  }

  if (data.purchasePrice < 0 || data.sellingPrice < 0) {
    throw new Error("Prices cannot be negative.");
  }
  if (data.stockQuantity < 0 || data.minimumStock < 0) {
    throw new Error("Stock values cannot be negative.");
  }

  const newVegetable: Vegetable = {
    _id: new ObjectId(),
    name: data.name.trim(),
    sku: normalizedSku,
    categoryId,
    categoryName: category.name,
    unit: data.unit,
    stockQuantity: Number(data.stockQuantity),
    minimumStock: Number(data.minimumStock),
    purchasePrice: Number(data.purchasePrice),
    sellingPrice: Number(data.sellingPrice),
    imageUrl: data.imageUrl?.trim() || undefined,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection<Vegetable>("vegetables").insertOne(newVegetable);

  // If initial stock was provided, create an Opening Stock movement
  if (newVegetable.stockQuantity > 0) {
    const userObjId = safeObjectId(userId) || new ObjectId();
    await db.collection<StockMovement>("stock_movements").insertOne({
      _id: new ObjectId(),
      vegetableId: newVegetable._id,
      vegetableName: newVegetable.name,
      movementType: "OPENING",
      quantity: newVegetable.stockQuantity,
      unit: newVegetable.unit,
      previousStock: 0,
      newStock: newVegetable.stockQuantity,
      reason: "Initial vegetable catalog registration",
      userId: userObjId,
      userName,
      createdAt: new Date(),
    });
  }

  return newVegetable;
}

export async function updateVegetable(
  id: string,
  data: {
    name?: string;
    sku?: string;
    categoryId?: string;
    unit?: UnitType;
    minimumStock?: number;
    purchasePrice?: number;
    sellingPrice?: number;
    imageUrl?: string;
    isActive?: boolean;
  }
): Promise<Vegetable | null> {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Vegetable ID");

  const db = await getDb();
  const updateDoc: any = { updatedAt: new Date() };

  if (data.name) updateDoc.name = data.name.trim();
  if (data.sku) {
    const normalizedSku = data.sku.trim().toUpperCase();
    const existing = await db.collection("vegetables").findOne({
      sku: normalizedSku,
      _id: { $ne: objectId },
    });
    if (existing) {
      throw new Error(`SKU "${normalizedSku}" is already in use by another vegetable.`);
    }
    updateDoc.sku = normalizedSku;
  }

  if (data.categoryId) {
    const catId = safeObjectId(data.categoryId);
    if (!catId) throw new Error("Invalid Category ID");
    const category = await db.collection("categories").findOne({ _id: catId });
    if (!category) throw new Error("Category not found");
    updateDoc.categoryId = catId;
    updateDoc.categoryName = category.name;
  }

  if (data.unit) updateDoc.unit = data.unit;
  if (data.minimumStock !== undefined) {
    if (data.minimumStock < 0) throw new Error("Minimum stock cannot be negative.");
    updateDoc.minimumStock = Number(data.minimumStock);
  }
  if (data.purchasePrice !== undefined) {
    if (data.purchasePrice < 0) throw new Error("Purchase price cannot be negative.");
    updateDoc.purchasePrice = Number(data.purchasePrice);
  }
  if (data.sellingPrice !== undefined) {
    if (data.sellingPrice < 0) throw new Error("Selling price cannot be negative.");
    updateDoc.sellingPrice = Number(data.sellingPrice);
  }
  if (data.imageUrl !== undefined) updateDoc.imageUrl = data.imageUrl.trim();
  if (data.isActive !== undefined) updateDoc.isActive = data.isActive;

  const result = await db.collection<Vegetable>("vegetables").findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result;
}

export async function adjustVegetableStock(
  id: string,
  adjustment: {
    quantity: number; // positive or negative adjustment delta
    reason: string;
    userId: string;
    userName: string;
  }
) {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Vegetable ID");

  const db = await getDb();
  const vegetable = await db.collection<Vegetable>("vegetables").findOne({ _id: objectId });
  if (!vegetable) throw new Error("Vegetable not found");

  const newStock = vegetable.stockQuantity + adjustment.quantity;
  if (newStock < 0) {
    throw new Error(
      `Stock cannot be negative. Current stock is ${vegetable.stockQuantity} ${vegetable.unit}.`
    );
  }

  const userObjId = safeObjectId(adjustment.userId) || new ObjectId();

  await db.collection("vegetables").updateOne(
    { _id: objectId },
    { $inc: { stockQuantity: adjustment.quantity }, $set: { updatedAt: new Date() } }
  );

  await db.collection<StockMovement>("stock_movements").insertOne({
    _id: new ObjectId(),
    vegetableId: objectId,
    vegetableName: vegetable.name,
    movementType: "MANUAL_ADJUSTMENT",
    quantity: adjustment.quantity,
    unit: vegetable.unit,
    previousStock: vegetable.stockQuantity,
    newStock,
    reason: adjustment.reason || "Manual inventory correction",
    userId: userObjId,
    userName: adjustment.userName,
    createdAt: new Date(),
  });

  return { success: true, newStock };
}
