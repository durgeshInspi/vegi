import { Db } from "mongodb";

/**
 * Atomically generates next sequential invoice number using MongoDB counters collection.
 * Prevents race conditions and duplicate invoice numbers.
 */
export async function getNextSequence(db: Db, sequenceName: string): Promise<number> {
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: sequenceName as any },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return result?.sequenceValue ?? 1;
}

export async function generateSaleInvoiceNumber(db: Db): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(db, `sale_${year}`);
  return `SALE-${year}-${String(seq).padStart(6, "0")}`;
}

export async function generatePurchaseInvoiceNumber(db: Db): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(db, `purchase_${year}`);
  return `PUR-${year}-${String(seq).padStart(6, "0")}`;
}
