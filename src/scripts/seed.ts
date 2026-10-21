import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "vegi_shop";

export async function seedDatabase() {
  console.log(`Connecting to MongoDB to seed database: "${dbName}"...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Clean existing data for fresh reproducible demo
    console.log("Cleaning old test data...");
    const collections = [
      "users",
      "categories",
      "vegetables",
      "suppliers",
      "customers",
      "purchases",
      "sales",
      "stock_movements",
      "wastage",
      "expense_categories",
      "expenses",
      "payments",
      "counters",
      "audit_logs",
    ];

    for (const collName of collections) {
      await db.collection(collName).deleteMany({});
    }

    // 1. Seed Users
    console.log("Seeding Users (Admin & Staff)...");
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const staffPasswordHash = await bcrypt.hash("staff123", 10);

    const adminId = new ObjectId();
    const staffId = new ObjectId();

    const usersData = [
      {
        _id: adminId,
        name: "Rajesh Kumar (Owner)",
        email: "admin@vegifresh.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        phone: "+91 98765 00001",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: staffId,
        name: "Sunil Verma (Cashier)",
        email: "staff@vegifresh.com",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        phone: "+91 98765 00002",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("users").insertMany(usersData);

    // 2. Seed Categories
    console.log("Seeding Categories...");
    const catLeafyId = new ObjectId();
    const catRootId = new ObjectId();
    const catSolanaceaeId = new ObjectId();
    const catGourdsId = new ObjectId();
    const catLegumesId = new ObjectId();
    const catAromaticsId = new ObjectId();

    const categoriesData = [
      {
        _id: catLeafyId,
        name: "Leafy Greens",
        slug: "leafy-greens",
        description: "Fresh green leaves, herbs, and bundles directly harvested from farms.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: catRootId,
        name: "Root Vegetables",
        slug: "root-vegetables",
        description: "Potatoes, onions, carrots, beets, and tubers with long shelf-life.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: catSolanaceaeId,
        name: "Solanaceae & Nightshades",
        slug: "solanaceae",
        description: "Juicy farm tomatoes, eggplants, capsicums, and chillies.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: catGourdsId,
        name: "Gourds & Cucumbers",
        slug: "gourds-cucumbers",
        description: "Lauki, karela, turai, tinda, and crisp fresh cucumbers.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: catLegumesId,
        name: "Beans & Pods",
        slug: "beans-pods",
        description: "Bhindi (okra), green peas, french beans, and cluster beans.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: catAromaticsId,
        name: "Alliums & Aromatics",
        slug: "alliums-aromatics",
        description: "Garlic, ginger, fresh lemons, and culinary flavor staples.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("categories").insertMany(categoriesData);

    // 3. Seed Vegetables
    console.log("Seeding Vegetables with stock and realistic pricing...");
    const vegTomatoId = new ObjectId();
    const vegPotatoId = new ObjectId();
    const vegOnionId = new ObjectId();
    const vegPalakId = new ObjectId();
    const vegMethiId = new ObjectId();
    const vegCorianderId = new ObjectId();
    const vegBhindiId = new ObjectId();
    const vegCapsicumId = new ObjectId();
    const vegCucumberId = new ObjectId();
    const vegCarrotId = new ObjectId();
    const vegGingerId = new ObjectId();
    const vegGarlicId = new ObjectId();
    const vegLemonId = new ObjectId();
    const vegLaukiId = new ObjectId();
    const vegGreenChilliId = new ObjectId();

    const vegetablesData = [
      {
        _id: vegTomatoId,
        name: "Hybrid Red Tomato",
        sku: "VEG-TOM-01",
        categoryId: catSolanaceaeId,
        categoryName: "Solanaceae & Nightshades",
        unit: "kg",
        stockQuantity: 140,
        minimumStock: 25,
        purchasePrice: 22,
        sellingPrice: 35,
        imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegPotatoId,
        name: "Fresh Agra Potato (Aloo)",
        sku: "VEG-POT-01",
        categoryId: catRootId,
        categoryName: "Root Vegetables",
        unit: "kg",
        stockQuantity: 280,
        minimumStock: 50,
        purchasePrice: 18,
        sellingPrice: 28,
        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegOnionId,
        name: "Nashik Red Onion (Pyaz)",
        sku: "VEG-ONI-01",
        categoryId: catRootId,
        categoryName: "Root Vegetables",
        unit: "kg",
        stockQuantity: 210,
        minimumStock: 40,
        purchasePrice: 26,
        sellingPrice: 38,
        imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegPalakId,
        name: "Desi Palak (Spinach)",
        sku: "VEG-PAL-01",
        categoryId: catLeafyId,
        categoryName: "Leafy Greens",
        unit: "bunch",
        stockQuantity: 45,
        minimumStock: 15,
        purchasePrice: 10,
        sellingPrice: 20,
        imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegMethiId,
        name: "Kasuri Methi Bundles",
        sku: "VEG-MET-01",
        categoryId: catLeafyId,
        categoryName: "Leafy Greens",
        unit: "bunch",
        stockQuantity: 30,
        minimumStock: 10,
        purchasePrice: 12,
        sellingPrice: 22,
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegCorianderId,
        name: "Fresh Coriander (Dhaniya)",
        sku: "VEG-COR-01",
        categoryId: catLeafyId,
        categoryName: "Leafy Greens",
        unit: "bunch",
        stockQuantity: 8, // Low stock on purpose
        minimumStock: 15,
        purchasePrice: 8,
        sellingPrice: 15,
        imageUrl: "https://images.unsplash.com/photo-1588879462719-75b225790c64?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegBhindiId,
        name: "Tender Bhindi (Lady Finger)",
        sku: "VEG-BHI-01",
        categoryId: catLegumesId,
        categoryName: "Beans & Pods",
        unit: "kg",
        stockQuantity: 65,
        minimumStock: 15,
        purchasePrice: 38,
        sellingPrice: 55,
        imageUrl: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegCapsicumId,
        name: "Shimla Mirch (Green Capsicum)",
        sku: "VEG-CAP-01",
        categoryId: catSolanaceaeId,
        categoryName: "Solanaceae & Nightshades",
        unit: "kg",
        stockQuantity: 40,
        minimumStock: 12,
        purchasePrice: 42,
        sellingPrice: 65,
        imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegCucumberId,
        name: "Desi Kheera (Cucumber)",
        sku: "VEG-CUC-01",
        categoryId: catGourdsId,
        categoryName: "Gourds & Cucumbers",
        unit: "kg",
        stockQuantity: 55,
        minimumStock: 15,
        purchasePrice: 20,
        sellingPrice: 35,
        imageUrl: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegCarrotId,
        name: "Sweet Red Delhi Carrot (Gajar)",
        sku: "VEG-CAR-01",
        categoryId: catRootId,
        categoryName: "Root Vegetables",
        unit: "kg",
        stockQuantity: 70,
        minimumStock: 20,
        purchasePrice: 30,
        sellingPrice: 48,
        imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegGingerId,
        name: "Fresh Ginger (Adrak)",
        sku: "VEG-GIN-01",
        categoryId: catAromaticsId,
        categoryName: "Alliums & Aromatics",
        unit: "kg",
        stockQuantity: 25,
        minimumStock: 8,
        purchasePrice: 90,
        sellingPrice: 140,
        imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegGarlicId,
        name: "Desi Garlic (Lahsun)",
        sku: "VEG-GAR-01",
        categoryId: catAromaticsId,
        categoryName: "Alliums & Aromatics",
        unit: "kg",
        stockQuantity: 35,
        minimumStock: 10,
        purchasePrice: 160,
        sellingPrice: 220,
        imageUrl: "https://images.unsplash.com/photo-1588615419957-c6b8eb7c17aa?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegLemonId,
        name: "Kagzi Nimbu (Lemon)",
        sku: "VEG-LEM-01",
        categoryId: catAromaticsId,
        categoryName: "Alliums & Aromatics",
        unit: "piece",
        stockQuantity: 180,
        minimumStock: 40,
        purchasePrice: 3,
        sellingPrice: 6,
        imageUrl: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegLaukiId,
        name: "Farm Fresh Lauki (Bottle Gourd)",
        sku: "VEG-LAU-01",
        categoryId: catGourdsId,
        categoryName: "Gourds & Cucumbers",
        unit: "piece",
        stockQuantity: 3, // Very low stock on purpose
        minimumStock: 10,
        purchasePrice: 18,
        sellingPrice: 30,
        imageUrl: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: vegGreenChilliId,
        name: "Spicy Green Chilli (Hari Mirch)",
        sku: "VEG-CHI-01",
        categoryId: catSolanaceaeId,
        categoryName: "Solanaceae & Nightshades",
        unit: "kg",
        stockQuantity: 20,
        minimumStock: 5,
        purchasePrice: 45,
        sellingPrice: 70,
        imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("vegetables").insertMany(vegetablesData);

    // Record initial opening stock movements
    const stockMovements = vegetablesData.map((v) => ({
      _id: new ObjectId(),
      vegetableId: v._id,
      vegetableName: v.name,
      movementType: "OPENING",
      quantity: v.stockQuantity,
      unit: v.unit,
      previousStock: 0,
      newStock: v.stockQuantity,
      reason: "Initial system opening stock audit",
      userId: adminId,
      userName: "Rajesh Kumar (Owner)",
      createdAt: new Date(),
    }));
    await db.collection("stock_movements").insertMany(stockMovements);

    // 4. Seed Suppliers
    console.log("Seeding Suppliers...");
    const suppRameshId = new ObjectId();
    const suppAzadpurId = new ObjectId();
    const suppKrishnaId = new ObjectId();

    const suppliersData = [
      {
        _id: suppRameshId,
        name: "Ramesh Agro Direct Farmers",
        phone: "+91 94220 11223",
        email: "ramesh.farmer@mandipost.in",
        address: "Village Ozar, Nashik District, Maharashtra",
        type: "FARMER",
        openingBalance: 0,
        currentBalance: 3200, // We owe ₹3,200 from recent delivery
        notes: "Supplies premium grade Nashik onions and fresh tomatoes twice a week.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: suppAzadpurId,
        name: "Azadpur Mandi Wholesale Merchants",
        phone: "+91 98111 88990",
        email: "contact@azadpurwholesalers.com",
        address: "Shed No. 14, Azadpur APMC Market, New Delhi",
        type: "WHOLESALER",
        openingBalance: 1500,
        currentBalance: 8400, // Balance payable
        notes: "Key bulk supplier for potatoes, carrots, ginger and seasonal greens.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: suppKrishnaId,
        name: "Krishna Organic Farms Hub",
        phone: "+91 97600 33445",
        email: "krishna@organicproduce.in",
        address: "Roorkee Road, Haridwar, Uttarakhand",
        type: "FARMER",
        openingBalance: 0,
        currentBalance: 0, // Fully cleared
        notes: "Certified pesticide-free palak, methi, coriander, and cucumbers.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("suppliers").insertMany(suppliersData);

    // 5. Seed Customers
    console.log("Seeding Customers...");
    const custWalkinId = new ObjectId();
    const custHotelId = new ObjectId();
    const custSharmaId = new ObjectId();

    const customersData = [
      {
        _id: custWalkinId,
        name: "General Walk-in Customer",
        phone: "+91 99999 00000",
        address: "Counter Sales",
        creditLimit: 0,
        outstandingBalance: 0,
        isWalkIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: custHotelId,
        name: "Hotel Green Leaf Restaurant",
        phone: "+91 98765 43210",
        email: "accounts@hotelgreenleaf.com",
        address: "32/B Commercial Complex, Main Road",
        creditLimit: 25000,
        outstandingBalance: 4850, // They owe us ₹4,850 on 15-day credit cycle
        isWalkIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: custSharmaId,
        name: "Mrs. Sunita Sharma",
        phone: "+91 98112 23344",
        address: "Flat 402, Royal Palms Residency",
        creditLimit: 5000,
        outstandingBalance: 620, // Regular monthly ledger customer
        isWalkIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("customers").insertMany(customersData);

    // 6. Seed Expense Categories & Expenses
    console.log("Seeding Expense Categories & Expenses...");
    const expCatRentId = new ObjectId();
    const expCatElecId = new ObjectId();
    const expCatTransId = new ObjectId();
    const expCatPackId = new ObjectId();
    const expCatSalId = new ObjectId();

    const expenseCategories = [
      { _id: expCatRentId, name: "Shop Rent", description: "Monthly commercial premises rent", createdAt: new Date() },
      { _id: expCatElecId, name: "Electricity & Cooling", description: "Deep freezer & shop power bills", createdAt: new Date() },
      { _id: expCatTransId, name: "Mandi Transport", description: "Tempo, auto freight, and unloading", createdAt: new Date() },
      { _id: expCatPackId, name: "Bags & Packaging", description: "Cloth bags, paper carry bags, crate liners", createdAt: new Date() },
      { _id: expCatSalId, name: "Staff Daily Wages", description: "Daily helper and cleaner payments", createdAt: new Date() },
    ];
    await db.collection("expense_categories").insertMany(expenseCategories);

    const sampleExpenses = [
      {
        _id: new ObjectId(),
        categoryId: expCatRentId,
        categoryName: "Shop Rent",
        title: "Shop Rent for Current Month",
        amount: 15000,
        paymentMethod: "UPI",
        date: new Date(),
        notes: "Paid via UPI to Landlord Mr. Gupta",
        recordedBy: adminId,
        recorderName: "Rajesh Kumar (Owner)",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        categoryId: expCatTransId,
        categoryName: "Mandi Transport",
        title: "Morning Mandi Tempo Freight",
        amount: 650,
        paymentMethod: "CASH",
        date: new Date(),
        notes: "Morning delivery from Azadpur Mandi",
        recordedBy: staffId,
        recorderName: "Sunil Verma (Cashier)",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        categoryId: expCatPackId,
        categoryName: "Bags & Packaging",
        title: "Biodegradable Vegetable Carry Bags (2000 pcs)",
        amount: 1200,
        paymentMethod: "UPI",
        date: new Date(),
        notes: "Purchased wholesale bag bundle",
        recordedBy: adminId,
        recorderName: "Rajesh Kumar (Owner)",
        createdAt: new Date(),
      },
    ];
    await db.collection("expenses").insertMany(sampleExpenses);

    // 7. Seed Wastage
    console.log("Seeding Wastage records...");
    const sampleWastage = [
      {
        _id: new ObjectId(),
        vegetableId: vegTomatoId,
        vegetableName: "Hybrid Red Tomato",
        quantity: 4.5,
        unit: "kg",
        costBasis: 22,
        totalLossValue: 4.5 * 22, // ₹99
        reason: "SPOILED",
        notes: "Bruised and overripe tomatoes during monsoon transit",
        recordedBy: staffId,
        recorderName: "Sunil Verma (Cashier)",
        date: new Date(),
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        vegetableId: vegPalakId,
        vegetableName: "Desi Palak (Spinach)",
        quantity: 3,
        unit: "bunch",
        costBasis: 10,
        totalLossValue: 30,
        reason: "QUALITY_LOSS",
        notes: "Leaves wilted due to midday heat",
        recordedBy: staffId,
        recorderName: "Sunil Verma (Cashier)",
        date: new Date(),
        createdAt: new Date(),
      },
    ];
    await db.collection("wastage").insertMany(sampleWastage);

    // Record wastage in stock movements
    for (const w of sampleWastage) {
      await db.collection("stock_movements").insertOne({
        _id: new ObjectId(),
        vegetableId: w.vegetableId,
        vegetableName: w.vegetableName,
        movementType: "WASTAGE",
        quantity: -w.quantity,
        unit: w.unit,
        previousStock: 144.5,
        newStock: 140,
        reason: `Wastage logged: ${w.reason} - ${w.notes}`,
        userId: staffId,
        userName: "Sunil Verma (Cashier)",
        createdAt: new Date(),
      });
    }

    // 8. Seed Purchases
    console.log("Seeding Purchases...");
    const samplePurchase = {
      _id: new ObjectId(),
      invoiceNumber: "PUR-2026-000001",
      supplierId: suppAzadpurId,
      supplierName: "Azadpur Mandi Wholesale Merchants",
      purchaseDate: new Date(),
      items: [
        {
          vegetableId: vegPotatoId,
          vegetableName: "Fresh Agra Potato (Aloo)",
          quantity: 100,
          unit: "kg",
          purchasePrice: 18,
          lineTotal: 1800,
        },
        {
          vegetableId: vegOnionId,
          vegetableName: "Nashik Red Onion (Pyaz)",
          quantity: 100,
          unit: "kg",
          purchasePrice: 26,
          lineTotal: 2600,
        },
      ],
      subtotal: 4400,
      discount: 100,
      transportCharges: 200,
      totalAmount: 4500,
      amountPaid: 2000,
      balanceDue: 2500,
      paymentStatus: "PARTIAL",
      paymentMethod: "UPI",
      notes: "First morning bulk delivery batch",
      status: "RECEIVED",
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("purchases").insertOne(samplePurchase);

    // 9. Seed Sales Invoices
    console.log("Seeding Sales Transactions...");
    const sampleSales = [
      {
        _id: new ObjectId(),
        invoiceNumber: "SALE-2026-000001",
        customerId: custWalkinId,
        customerName: "Walk-in Customer",
        items: [
          {
            vegetableId: vegTomatoId,
            vegetableName: "Hybrid Red Tomato",
            quantity: 2,
            unit: "kg",
            sellingPrice: 35,
            unitCost: 22,
            lineTotal: 70,
          },
          {
            vegetableId: vegPotatoId,
            vegetableName: "Fresh Agra Potato (Aloo)",
            quantity: 3,
            unit: "kg",
            sellingPrice: 28,
            unitCost: 18,
            lineTotal: 84,
          },
          {
            vegetableId: vegPalakId,
            vegetableName: "Desi Palak (Spinach)",
            quantity: 2,
            unit: "bunch",
            sellingPrice: 20,
            unitCost: 10,
            lineTotal: 40,
          },
        ],
        subtotal: 194,
        discount: 4,
        totalAmount: 190,
        amountPaid: 190,
        balanceDue: 0,
        paymentMethod: "UPI",
        paymentStatus: "PAID",
        status: "COMPLETED",
        cashierId: staffId,
        cashierName: "Sunil Verma (Cashier)",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        invoiceNumber: "SALE-2026-000002",
        customerId: custHotelId,
        customerName: "Hotel Green Leaf Restaurant",
        customerPhone: "+91 98765 43210",
        items: [
          {
            vegetableId: vegOnionId,
            vegetableName: "Nashik Red Onion (Pyaz)",
            quantity: 25,
            unit: "kg",
            sellingPrice: 38,
            unitCost: 26,
            lineTotal: 950,
          },
          {
            vegetableId: vegTomatoId,
            vegetableName: "Hybrid Red Tomato",
            quantity: 20,
            unit: "kg",
            sellingPrice: 35,
            unitCost: 22,
            lineTotal: 700,
          },
          {
            vegetableId: vegGingerId,
            vegetableName: "Fresh Ginger (Adrak)",
            quantity: 3,
            unit: "kg",
            sellingPrice: 140,
            unitCost: 90,
            lineTotal: 420,
          },
          {
            vegetableId: vegGarlicId,
            vegetableName: "Desi Garlic (Lahsun)",
            quantity: 2,
            unit: "kg",
            sellingPrice: 220,
            unitCost: 160,
            lineTotal: 440,
          },
        ],
        subtotal: 2510,
        discount: 60,
        totalAmount: 2450,
        amountPaid: 0,
        balanceDue: 2450,
        paymentMethod: "CREDIT",
        paymentStatus: "UNPAID",
        status: "COMPLETED",
        cashierId: staffId,
        cashierName: "Sunil Verma (Cashier)",
        notes: "Bi-weekly credit supply for restaurant kitchen",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        invoiceNumber: "SALE-2026-000003",
        customerId: custWalkinId,
        customerName: "Walk-in Customer",
        items: [
          {
            vegetableId: vegBhindiId,
            vegetableName: "Tender Bhindi (Lady Finger)",
            quantity: 1.5,
            unit: "kg",
            sellingPrice: 55,
            unitCost: 38,
            lineTotal: 82.5,
          },
          {
            vegetableId: vegCucumberId,
            vegetableName: "Desi Kheera (Cucumber)",
            quantity: 1,
            unit: "kg",
            sellingPrice: 35,
            unitCost: 20,
            lineTotal: 35,
          },
          {
            vegetableId: vegLemonId,
            vegetableName: "Kagzi Nimbu (Lemon)",
            quantity: 5,
            unit: "piece",
            sellingPrice: 6,
            unitCost: 3,
            lineTotal: 30,
          },
        ],
        subtotal: 147.5,
        discount: 2.5,
        totalAmount: 145,
        amountPaid: 145,
        balanceDue: 0,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        status: "COMPLETED",
        cashierId: staffId,
        cashierName: "Sunil Verma (Cashier)",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("sales").insertMany(sampleSales);

    // Seed counters so next invoices are sequential
    const year = new Date().getFullYear();
    await db.collection("counters").updateOne(
      { _id: `sale_${year}` as any },
      { $set: { sequenceValue: 3 } },
      { upsert: true }
    );
    await db.collection("counters").updateOne(
      { _id: `purchase_${year}` as any },
      { $set: { sequenceValue: 1 } },
      { upsert: true }
    );

    console.log("✅ Database seeded successfully!");
    console.log("\n-------------------------------------------");
    console.log("Demo Credentials:");
    console.log("Admin: admin@vegifresh.com / admin123");
    console.log("Staff: staff@vegifresh.com / staff123");
    console.log("-------------------------------------------\n");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module || process.argv[1]?.includes("seed")) {
  seedDatabase();
}
