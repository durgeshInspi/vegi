import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Expense, ExpenseCategory, PaymentMethod } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const db = await getDb();
  return db.collection<ExpenseCategory>("expense_categories").find({}).sort({ name: 1 }).toArray();
}

export async function createExpenseCategory(data: { name: string; description?: string }): Promise<ExpenseCategory> {
  const db = await getDb();
  const existing = await db.collection("expense_categories").findOne({ name: data.name.trim() });
  if (existing) {
    throw new Error(`Expense category "${data.name}" already exists.`);
  }

  const category: ExpenseCategory = {
    _id: new ObjectId(),
    name: data.name.trim(),
    description: data.description?.trim(),
    createdAt: new Date(),
  };

  await db.collection<ExpenseCategory>("expense_categories").insertOne(category);
  return category;
}

export async function getExpenses(params: {
  categoryId?: string;
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
  if (params.categoryId && params.categoryId !== "ALL") {
    const cId = safeObjectId(params.categoryId);
    if (cId) filter.categoryId = cId;
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
      .collection<Expense>("expenses")
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("expenses").countDocuments(filter),
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

export async function createExpense(
  data: {
    categoryId: string;
    title: string;
    amount: number;
    paymentMethod: PaymentMethod;
    date?: string | Date;
    notes?: string;
  },
  userId: string,
  userName: string
): Promise<Expense> {
  const db = await getDb();
  const catId = safeObjectId(data.categoryId);
  if (!catId) throw new Error("Invalid Expense Category selected.");

  const category = await db.collection<ExpenseCategory>("expense_categories").findOne({ _id: catId });
  if (!category) throw new Error("Expense category not found.");

  const amount = Number(data.amount);
  if (amount <= 0) throw new Error("Expense amount must be greater than zero.");

  const expense: Expense = {
    _id: new ObjectId(),
    categoryId: catId,
    categoryName: category.name,
    title: data.title.trim(),
    amount,
    paymentMethod: data.paymentMethod,
    date: data.date ? new Date(data.date) : new Date(),
    notes: data.notes?.trim() || undefined,
    recordedBy: safeObjectId(userId) || new ObjectId(),
    recorderName: userName,
    createdAt: new Date(),
  };

  await db.collection<Expense>("expenses").insertOne(expense);
  return expense;
}
