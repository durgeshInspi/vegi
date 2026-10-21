import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { StockMovement, Vegetable } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export async function getStockMovements(params: {
  vegetableId?: string;
  movementType?: string;
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
  if (params.movementType && params.movementType !== "ALL") {
    filter.movementType = params.movementType;
  }

  const [items, totalCount] = await Promise.all([
    db
      .collection<StockMovement>("stock_movements")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("stock_movements").countDocuments(filter),
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

export async function getLowStockVegetables() {
  const db = await getDb();
  return db
    .collection<Vegetable>("vegetables")
    .find({
      isActive: true,
      $expr: { $lte: ["$stockQuantity", "$minimumStock"] },
    })
    .sort({ stockQuantity: 1 })
    .toArray();
}

export async function getInventoryValuation() {
  const db = await getDb();
  const result = await db
    .collection("vegetables")
    .aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          stockQuantity: 1,
          purchasePrice: 1,
          sellingPrice: 1,
          valuationCost: { $multiply: ["$stockQuantity", "$purchasePrice"] },
          valuationRetail: { $multiply: ["$stockQuantity", "$sellingPrice"] },
        },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStockUnits: { $sum: "$stockQuantity" },
          totalValuationCost: { $sum: "$valuationCost" },
          totalValuationRetail: { $sum: "$valuationRetail" },
        },
      },
    ])
    .toArray();

  if (result.length > 0) {
    return {
      totalItems: result[0].totalItems || 0,
      totalStockUnits: Math.round((result[0].totalStockUnits || 0) * 100) / 100,
      totalValuationCost: Math.round((result[0].totalValuationCost || 0) * 100) / 100,
      totalValuationRetail: Math.round((result[0].totalValuationRetail || 0) * 100) / 100,
    };
  }

  return {
    totalItems: 0,
    totalStockUnits: 0,
    totalValuationCost: 0,
    totalValuationRetail: 0,
  };
}
