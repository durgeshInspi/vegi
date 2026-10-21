import { getDb } from "@/lib/mongodb";
import { Sale, Purchase, Expense, Wastage, Customer, Supplier, Vegetable } from "@/types";

export interface DashboardMetrics {
  todaySales: number;
  todayPurchases: number;
  todayExpenses: number;
  todayGrossProfit: number;
  todayNetProfit: number;
  totalReceivables: number; // Customer credit balance
  totalPayables: number; // Supplier outstanding balance
  inventoryValuationCost: number;
  totalWastageValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentSales: Sale[];
  recentPurchases: Purchase[];
  topSellingVegetables: {
    vegetableName: string;
    totalQuantity: number;
    unit: string;
    totalRevenue: number;
  }[];
  salesTrend: {
    date: string;
    sales: number;
    purchases: number;
    expenses: number;
    profit: number;
  }[];
  paymentBreakdown: {
    method: string;
    amount: number;
    count: number;
  }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = await getDb();

  // 1. Time boundaries for "Today" (Asia/Kolkata day window)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 2. Today's Sales & COGS Aggregation
  const todaySalesAgg = await db
    .collection("sales")
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: { $ne: "CANCELLED" },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.lineTotal" },
          totalCOGS: { $sum: { $multiply: ["$items.quantity", "$items.unitCost"] } },
        },
      },
    ])
    .toArray();

  const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].totalRevenue : 0;
  const todayCOGS = todaySalesAgg.length > 0 ? todaySalesAgg[0].totalCOGS : 0;
  const todayGrossProfit = Math.max(0, todaySales - todayCOGS);

  // 3. Today's Purchases Aggregation
  const todayPurchasesAgg = await db
    .collection("purchases")
    .aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfToday, $lte: endOfToday },
          status: "RECEIVED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])
    .toArray();
  const todayPurchases = todayPurchasesAgg.length > 0 ? todayPurchasesAgg[0].total : 0;

  // 4. Today's Expenses Aggregation
  const todayExpensesAgg = await db
    .collection("expenses")
    .aggregate([
      {
        $match: {
          date: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])
    .toArray();
  const todayExpenses = todayExpensesAgg.length > 0 ? todayExpensesAgg[0].total : 0;

  // 5. Today's Wastage Aggregation
  const todayWastageAgg = await db
    .collection("wastage")
    .aggregate([
      {
        $match: {
          date: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalLossValue" },
        },
      },
    ])
    .toArray();
  const todayWastage = todayWastageAgg.length > 0 ? todayWastageAgg[0].total : 0;

  const todayNetProfit = todayGrossProfit - todayExpenses - todayWastage;

  // 6. Outstanding Receivables (Customers with balance > 0)
  const custBalancesAgg = await db
    .collection("customers")
    .aggregate([
      { $match: { outstandingBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$outstandingBalance" } } },
    ])
    .toArray();
  const totalReceivables = custBalancesAgg.length > 0 ? custBalancesAgg[0].total : 0;

  // 7. Outstanding Payables (Suppliers with balance > 0)
  const suppBalancesAgg = await db
    .collection("suppliers")
    .aggregate([
      { $match: { currentBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$currentBalance" } } },
    ])
    .toArray();
  const totalPayables = suppBalancesAgg.length > 0 ? suppBalancesAgg[0].total : 0;

  // 8. Inventory Valuation & Stock Alerts
  const [valuationAgg, lowStockCount, outOfStockCount] = await Promise.all([
    db
      .collection("vegetables")
      .aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalCost: { $sum: { $multiply: ["$stockQuantity", "$purchasePrice"] } },
          },
        },
      ])
      .toArray(),
    db.collection("vegetables").countDocuments({
      isActive: true,
      $expr: {
        $and: [{ $lte: ["$stockQuantity", "$minimumStock"] }, { $gt: ["$stockQuantity", 0] }],
      },
    }),
    db.collection("vegetables").countDocuments({
      isActive: true,
      stockQuantity: { $lte: 0 },
    }),
  ]);

  const inventoryValuationCost = valuationAgg.length > 0 ? valuationAgg[0].totalCost : 0;

  // 9. Total Wastage (Overall)
  const totalWastageAgg = await db
    .collection("wastage")
    .aggregate([{ $group: { _id: null, total: { $sum: "$totalLossValue" } } }])
    .toArray();
  const totalWastageValue = totalWastageAgg.length > 0 ? totalWastageAgg[0].total : 0;

  // 10. Recent 5 Sales & Purchases
  const [recentSales, recentPurchases] = await Promise.all([
    db.collection<Sale>("sales").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    db.collection<Purchase>("purchases").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  // 11. Top Selling Vegetables
  const topSellingAgg = await db
    .collection("sales")
    .aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.vegetableId",
          vegetableName: { $first: "$items.vegetableName" },
          unit: { $first: "$items.unit" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 },
    ])
    .toArray();

  const topSellingVegetables = topSellingAgg.map((item) => ({
    vegetableName: item.vegetableName,
    unit: item.unit || "kg",
    totalQuantity: Math.round(item.totalQuantity * 10) / 10,
    totalRevenue: Math.round(item.totalRevenue),
  }));

  // 12. Payment method breakdown
  const paymentBreakdownAgg = await db
    .collection("sales")
    .aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ])
    .toArray();

  const paymentBreakdown = paymentBreakdownAgg.map((p) => ({
    method: p._id || "CASH",
    amount: Math.round(p.amount),
    count: p.count,
  }));

  // 13. 7-Day Trend Chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [salesTrendAgg, purchasesTrendAgg, expensesTrendAgg] = await Promise.all([
    db
      .collection("sales")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: "CANCELLED" },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d-%m", date: "$createdAt", timezone: "Asia/Kolkata" },
            },
            total: { $sum: "$totalAmount" },
          },
        },
      ])
      .toArray(),
    db
      .collection("purchases")
      .aggregate([
        {
          $match: {
            purchaseDate: { $gte: sevenDaysAgo },
            status: "RECEIVED",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d-%m", date: "$purchaseDate", timezone: "Asia/Kolkata" },
            },
            total: { $sum: "$totalAmount" },
          },
        },
      ])
      .toArray(),
    db
      .collection("expenses")
      .aggregate([
        {
          $match: {
            date: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d-%m", date: "$date", timezone: "Asia/Kolkata" },
            },
            total: { $sum: "$amount" },
          },
        },
      ])
      .toArray(),
  ]);

  // Build daily timeline map
  const salesTrend: DashboardMetrics["salesTrend"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = String(d.getDate()).padStart(2, "0") + "-" + String(d.getMonth() + 1).padStart(2, "0");

    const s = salesTrendAgg.find((item) => item._id === dayStr)?.total || 0;
    const p = purchasesTrendAgg.find((item) => item._id === dayStr)?.total || 0;
    const e = expensesTrendAgg.find((item) => item._id === dayStr)?.total || 0;

    salesTrend.push({
      date: dayStr,
      sales: Math.round(s),
      purchases: Math.round(p),
      expenses: Math.round(e),
      profit: Math.round(s - p - e),
    });
  }

  return {
    todaySales: Math.round(todaySales * 100) / 100,
    todayPurchases: Math.round(todayPurchases * 100) / 100,
    todayExpenses: Math.round(todayExpenses * 100) / 100,
    todayGrossProfit: Math.round(todayGrossProfit * 100) / 100,
    todayNetProfit: Math.round(todayNetProfit * 100) / 100,
    totalReceivables: Math.round(totalReceivables * 100) / 100,
    totalPayables: Math.round(totalPayables * 100) / 100,
    inventoryValuationCost: Math.round(inventoryValuationCost * 100) / 100,
    totalWastageValue: Math.round(totalWastageValue * 100) / 100,
    lowStockCount,
    outOfStockCount,
    recentSales,
    recentPurchases,
    topSellingVegetables,
    salesTrend,
    paymentBreakdown,
  };
}

export async function getFinancialReport(dateFrom?: string, dateTo?: string) {
  const db = await getDb();

  const filterSales: any = { status: { $ne: "CANCELLED" } };
  const filterPurchases: any = { status: "RECEIVED" };
  const filterExpenses: any = {};
  const filterWastage: any = {};

  if (dateFrom || dateTo) {
    const dateQuery: any = {};
    if (dateFrom) dateQuery.$gte = new Date(dateFrom);
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      dateQuery.$lte = toDate;
    }
    filterSales.createdAt = dateQuery;
    filterPurchases.purchaseDate = dateQuery;
    filterExpenses.date = dateQuery;
    filterWastage.date = dateQuery;
  }

  const [salesAgg, purchasesAgg, expensesAgg, wastageAgg] = await Promise.all([
    db
      .collection("sales")
      .aggregate([
        { $match: filterSales },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$items.lineTotal" },
            totalCOGS: { $sum: { $multiply: ["$items.quantity", "$items.unitCost"] } },
            totalDiscount: { $sum: "$discount" },
          },
        },
      ])
      .toArray(),
    db
      .collection("purchases")
      .aggregate([
        { $match: filterPurchases },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: "$totalAmount" },
            totalTransport: { $sum: "$transportCharges" },
          },
        },
      ])
      .toArray(),
    db
      .collection("expenses")
      .aggregate([
        { $match: filterExpenses },
        { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
      ])
      .toArray(),
    db
      .collection("wastage")
      .aggregate([
        { $match: filterWastage },
        { $group: { _id: null, totalWastageLoss: { $sum: "$totalLossValue" } } },
      ])
      .toArray(),
  ]);

  const totalRevenue = salesAgg.length > 0 ? salesAgg[0].totalRevenue : 0;
  const totalCOGS = salesAgg.length > 0 ? salesAgg[0].totalCOGS : 0;
  const grossProfit = Math.max(0, totalRevenue - totalCOGS);

  const totalPurchases = purchasesAgg.length > 0 ? purchasesAgg[0].totalPurchases : 0;
  const totalExpenses = expensesAgg.length > 0 ? expensesAgg[0].totalExpenses : 0;
  const totalWastageLoss = wastageAgg.length > 0 ? wastageAgg[0].totalWastageLoss : 0;

  const netOperatingProfit = grossProfit - totalExpenses - totalWastageLoss;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netProfitMargin = totalRevenue > 0 ? (netOperatingProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCOGS: Math.round(totalCOGS * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossProfitMargin: Math.round(grossProfitMargin * 10) / 10,
    totalPurchases: Math.round(totalPurchases * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalWastageLoss: Math.round(totalWastageLoss * 100) / 100,
    netOperatingProfit: Math.round(netOperatingProfit * 100) / 100,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
  };
}
