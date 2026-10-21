import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "vegi_shop";

export async function initializeDatabase() {
  console.log(`Connecting to MongoDB at: ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected successfully to database: "${dbName}"`);

    // 1. Users Indexes
    console.log("Setting up 'users' collection indexes...");
    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ role: 1 });

    // 2. Categories Indexes
    console.log("Setting up 'categories' collection indexes...");
    const categories = db.collection("categories");
    await categories.createIndex({ name: 1 }, { unique: true });
    await categories.createIndex({ slug: 1 }, { unique: true });

    // 3. Vegetables Indexes
    console.log("Setting up 'vegetables' collection indexes...");
    const vegetables = db.collection("vegetables");
    await vegetables.createIndex({ sku: 1 }, { unique: true });
    await vegetables.createIndex({ name: 1 });
    await vegetables.createIndex({ categoryId: 1 });
    await vegetables.createIndex({ isActive: 1, stockQuantity: 1 });

    // 4. Suppliers Indexes
    console.log("Setting up 'suppliers' collection indexes...");
    const suppliers = db.collection("suppliers");
    await suppliers.createIndex({ phone: 1 });
    await suppliers.createIndex({ name: 1 });

    // 5. Customers Indexes
    console.log("Setting up 'customers' collection indexes...");
    const customers = db.collection("customers");
    await customers.createIndex({ phone: 1 });
    await customers.createIndex({ name: 1 });

    // 6. Purchases Indexes
    console.log("Setting up 'purchases' collection indexes...");
    const purchases = db.collection("purchases");
    await purchases.createIndex({ invoiceNumber: 1 }, { unique: true });
    await purchases.createIndex({ supplierId: 1 });
    await purchases.createIndex({ purchaseDate: -1 });
    await purchases.createIndex({ paymentStatus: 1 });

    // 7. Sales Indexes
    console.log("Setting up 'sales' collection indexes...");
    const sales = db.collection("sales");
    await sales.createIndex({ invoiceNumber: 1 }, { unique: true });
    await sales.createIndex({ customerId: 1 });
    await sales.createIndex({ createdAt: -1 });
    await sales.createIndex({ paymentStatus: 1 });
    await sales.createIndex({ status: 1 });
    // Compound index for date & status reporting
    await sales.createIndex({ createdAt: -1, status: 1 });

    // 8. Stock Movements Indexes
    console.log("Setting up 'stock_movements' collection indexes...");
    const stockMovements = db.collection("stock_movements");
    await stockMovements.createIndex({ vegetableId: 1, createdAt: -1 });
    await stockMovements.createIndex({ movementType: 1 });
    await stockMovements.createIndex({ referenceId: 1 });

    // 9. Wastage Indexes
    console.log("Setting up 'wastage' collection indexes...");
    const wastage = db.collection("wastage");
    await wastage.createIndex({ date: -1 });
    await wastage.createIndex({ vegetableId: 1 });

    // 10. Expenses Indexes
    console.log("Setting up 'expenses' collection indexes...");
    const expenses = db.collection("expenses");
    await expenses.createIndex({ date: -1 });
    await expenses.createIndex({ categoryId: 1 });

    // 11. Expense Categories Indexes
    console.log("Setting up 'expense_categories' collection indexes...");
    const expenseCategories = db.collection("expense_categories");
    await expenseCategories.createIndex({ name: 1 }, { unique: true });

    // 12. Payments Indexes
    console.log("Setting up 'payments' collection indexes...");
    const payments = db.collection("payments");
    await payments.createIndex({ entityId: 1, date: -1 });
    await payments.createIndex({ type: 1 });

    // 13. Audit logs
    console.log("Setting up 'audit_logs' collection indexes...");
    const auditLogs = db.collection("audit_logs");
    await auditLogs.createIndex({ createdAt: -1 });

    console.log("✅ All MongoDB collections and indexes initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing MongoDB:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("init-db")) {
  initializeDatabase();
}
