import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Category } from "@/types";
import { safeObjectId } from "@/lib/mongo-utils";

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.collection<Category>("categories").find({}).sort({ name: 1 }).toArray();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const objectId = safeObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  return db.collection<Category>("categories").findOne({ _id: objectId });
}

export async function createCategory(data: {
  name: string;
  description?: string;
}): Promise<Category> {
  const db = await getDb();
  const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const existing = await db.collection<Category>("categories").findOne({
    $or: [{ name: data.name.trim() }, { slug }],
  });

  if (existing) {
    throw new Error(`Category with name "${data.name}" already exists.`);
  }

  const newCategory: Category = {
    _id: new ObjectId(),
    name: data.name.trim(),
    slug,
    description: data.description?.trim(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection<Category>("categories").insertOne(newCategory);
  return newCategory;
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string; isActive?: boolean }
): Promise<Category | null> {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Category ID");

  const db = await getDb();
  const updateDoc: Partial<Category> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (data.name) {
    updateDoc.name = data.name.trim();
    updateDoc.slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  }
  if (data.description !== undefined) {
    updateDoc.description = data.description.trim();
  }
  if (data.isActive !== undefined) {
    updateDoc.isActive = data.isActive;
  }

  const result = await db.collection<Category>("categories").findOneAndUpdate(
    { _id: objectId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const objectId = safeObjectId(id);
  if (!objectId) throw new Error("Invalid Category ID");

  const db = await getDb();

  // Guard: Ensure no vegetables reference this category
  const assignedVegetable = await db.collection("vegetables").findOne({ categoryId: objectId });
  if (assignedVegetable) {
    throw new Error("Cannot delete category because vegetables are currently assigned to it.");
  }

  const result = await db.collection("categories").deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}
