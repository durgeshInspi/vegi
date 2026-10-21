import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getVegetables } from "@/modules/vegetables/vegetable.service";
import { getCategories } from "@/modules/categories/category.service";
import { getDb } from "@/lib/mongodb";
import { serializeMongo, safeObjectId } from "@/lib/mongo-utils";
import { Vegetable } from "@/types";
import ShopHomeClient from "@/components/shop/ShopHomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VegiFresh Market — Fresh Vegetables Delivered to Your Doorstep",
  description:
    "Shop farm-fresh vegetables at great prices. Freshness you can trust, delivered with care. Direct farmer sourcing, 30-minute delivery in Mumbai, Pune, and Bangalore.",
};

async function getBestSellersData(): Promise<(Vegetable & { salesRank?: number })[]> {
  try {
    const db = await getDb();

    // Aggregate top sold items from real sales invoices in database
    const topSales = await db
      .collection("sales")
      .aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.vegetableId",
            totalQuantitySold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: 8 },
      ])
      .toArray();

    const vegetableIds = topSales
      .map((item) => safeObjectId(item._id))
      .filter((id): id is NonNullable<typeof id> => id !== null);

    let bestSellers: (Vegetable & { salesRank?: number })[] = [];

    if (vegetableIds.length > 0) {
      const vegs = await db
        .collection<Vegetable>("vegetables")
        .find({ _id: { $in: vegetableIds }, isActive: true })
        .toArray();

      bestSellers = topSales
        .map((ts, index) => {
          const veg = vegs.find((v) => v._id.toString() === ts._id.toString());
          if (!veg) return null;
          return {
            ...veg,
            salesRank: index + 1,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    // Supplement if fewer than 4 items have sales data
    if (bestSellers.length < 4) {
      const existingIds = bestSellers.map((v) => v._id);
      const supplemental = await db
        .collection<Vegetable>("vegetables")
        .find({ _id: { $nin: existingIds }, isActive: true })
        .limit(4 - bestSellers.length)
        .toArray();

      bestSellers = [...bestSellers, ...supplemental];
    }

    return bestSellers;
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export default async function HomePage() {
  // 1. Session check (to display User name/Dashboard link in header if logged in)
  const currentUser = await getCurrentUser();

  // 2. Fetch live vegetables from database
  const vegResult = await getVegetables({ status: "active", limit: 100 });
  const rawVegetables = vegResult.items || [];

  // 3. Fetch categories
  const rawCategories = await getCategories();
  const activeCategories = rawCategories.filter((c) => c.isActive !== false);

  // 4. Fetch actual best sellers
  const rawBestSellers = await getBestSellersData();

  return (
    <ShopHomeClient
      initialVegetables={serializeMongo(rawVegetables)}
      initialCategories={serializeMongo(activeCategories)}
      initialBestSellers={serializeMongo(rawBestSellers)}
      currentUser={currentUser ? serializeMongo(currentUser) : null}
    />
  );
}
