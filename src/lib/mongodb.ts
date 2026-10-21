import { MongoClient, Db, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "vegi_shop";

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the client is preserved
  // across HMR module reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the cached native MongoClient promise.
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the active MongoDB Database instance.
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * Helper to check if the current deployment supports multi-document transactions.
 * Transactions require a replica set or mongos sharded cluster.
 */
export async function supportsTransactions(client: MongoClient): Promise<boolean> {
  try {
    const adminDb = client.db().admin();
    const hello = await adminDb.command({ hello: 1 });
    // If setName exists, it is part of a replica set
    return Boolean(hello.setName || hello.msg === "isdbgrid");
  } catch {
    return false;
  }
}

export default clientPromise;
