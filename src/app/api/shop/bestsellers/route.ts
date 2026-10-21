import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Vegetable } from "@/types";
import { serializeMongo, safeObjectId } from "@/lib/mongo-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();

    // Aggregate top sold items from actual sales data
    const topSales = await db
      .collection("sales")
      .aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.vegetableId",
            totalQuantitySold: { $sum: "$items.quantity" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: 8 },
      ])
      .toArray();

    const vegetableIds = topSales
      .map((item) => safeObjectId(item._id))
      .filter((id): id is NonNullable<typeof id> => id !== null);

    let bestSellers: (Vegetable & { totalSoldQty?: number; salesRank?: number })[] = [];

    if (vegetableIds.length > 0) {
      const vegs = await db
        .collection<Vegetable>("vegetables")
        .find({ _id: { $in: vegetableIds }, isActive: true })
        .toArray();

      // Order according to the sales rank
      bestSellers = topSales
        .map((ts, index) => {
          const veg = vegs.find((v) => v._id.toString() === ts._id.toString());
          if (!veg) return null;
          return {
            ...veg,
            totalSoldQty: ts.totalQuantitySold,
            salesRank: index + 1,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    // If sales are fewer than 4, supplement with active vegetables from catalog
    if (bestSellers.length < 4) {
      const existingIds = bestSellers.map((v) => v._id);
      const supplemental = await db
        .collection<Vegetable>("vegetables")
        .find({ _id: { $nin: existingIds }, isActive: true })
        .limit(6 - bestSellers.length)
        .toArray();

      bestSellers = [...bestSellers, ...supplemental];
    }

    return NextResponse.json({
      items: serializeMongo(bestSellers),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch best sellers" },
      { status: 500 }
    );
  }
}
