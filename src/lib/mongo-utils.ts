import { ObjectId } from "mongodb";

/**
 * Safely parses string into ObjectId or returns null if invalid.
 */
export function safeObjectId(id?: string | ObjectId | null): ObjectId | null {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  return null;
}

/**
 * Deeply serializes MongoDB documents into plain JavaScript objects safe for React Server/Client Components.
 * Converts ObjectId -> string and Date -> ISO string.
 */
export function serializeMongo<T>(data: any): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof ObjectId) {
    return data.toString() as any;
  }

  if (data instanceof Date) {
    return data.toISOString() as any;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeMongo(item)) as any;
  }

  if (typeof data === "object") {
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeMongo(value);
    }
    return serialized as T;
  }

  return data;
}
