# VegiFresh Market — Vegetable Shop Management & POS System

A production-grade Vegetable Shop Management and Point-of-Sale (POS) System built for vegetable retail and wholesale mandi operations. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and the official **MongoDB Node.js Driver** directly (Zero ORMs/ODMs — No Prisma, No Mongoose).

---

## 🥬 Key Features & Modules

### 1. Real-Time Operations Dashboard (`/dashboard`)
- **Live MongoDB Aggregations**: Real-time calculated values for Today's Sales, Purchases, Operating Expenses, Gross Profit, and Estimated Net Operating Profit.
- **Inventory Valuation**: Current total cost basis of stock on the shop floor.
- **Credit & Debt Indicators**: Total customer receivables and total supplier payables.
- **Stock Warnings**: Real-time badges for Low-Stock and Out-of-Stock produce.
- **Visual Analytics**: 7-day sales vs. purchases area trend charts and payment method distribution charts using **Recharts**.
- **Fast Launch POS Counter**: Direct shortcut to cashier register.

### 2. Fast POS Billing Terminal (`/sales/pos`)
- **Fast Grocery Cashier Workflow**: Instant search by produce name or SKU barcode.
- **Category Filter Tabs**: Quick category navigation (Leafy Greens, Root, Solanaceae, Gourds, Aromatics).
- **Stock Guard Protection**: Real-time available stock validation preventing negative inventory or overselling.
- **Itemized Cart**: Increment/decrement quantity (`+` / `-`), custom fractional quantities (e.g. `1.5 kg`), and live line totals.
- **Multi-Payment Modes**: Cash, UPI (GPay/PhonePe), Card, and Customer Credit.
- **Cash Tender Calculator**: Enter cash received to auto-compute change due to customer.
- **Printable Thermal Bills**: Print 80mm thermal receipts with store details, GSTIN, itemized quantities, discounts, and payment mode.

### 3. Vegetable Catalog Management (`/vegetables`)
- **Full CRUD**: Add, edit, adjust stock, and archive produce items.
- **Rich Produce Attributes**: SKU, Category reference, unit type (`kg`, `gram`, `piece`, `bunch`, `crate`), wholesale cost, retail selling price, profit margin %, image URL, and minimum threshold alert.
- **Stock Auditing**: Quick manual stock adjustment with mandatory audit reason logging.

### 4. Produce Categories (`/categories`)
- **Category CRUD**: Organize vegetables into functional groups (Leafy Greens, Root Vegetables, Solanaceae, Gourds, Alliums, etc.).
- **Integrity Guard**: Blocks deletion of categories that have active vegetables assigned.

### 5. Inward Wholesale Purchases (`/purchases`)
- **Farmer & Wholesaler Receiving**: Record bulk shipments from farmers or APMC mandis.
- **Auto Stock Inward**: Receiving a purchase automatically updates inventory stock for each vegetable.
- **Cost Averaging**: Captures latest wholesale cost.
- **Supplier Ledger Integration**: Automatically adds unpaid balance to supplier's outstanding ledger.

### 6. Suppliers & Customer Credit Ledgers (`/suppliers` & `/customers`)
- **Supplier Management**: Track direct farmers and mandi wholesalers, contact info, and payable balances.
- **Supplier Settlements**: Modal to record payments made to suppliers with instant ledger adjustment.
- **Customer Profiles**: Regular family customers and commercial restaurant accounts with credit limits.
- **Collect Due**: Modal to collect outstanding credit payments with receipts.

### 7. Inventory & Stock Movement Audit Trail (`/inventory`)
- **Immutable Audit Trail**: Dedicated `stock_movements` collection recording every single stock delta.
- **Movement Types**: `OPENING`, `PURCHASE_RECEIPT`, `SALE`, `WASTAGE`, `MANUAL_ADJUSTMENT`, `SALES_RETURN`.
- **Traceability**: Records timestamp, delta quantity, unit, previous stock, new stock, reference invoice #, reason, and responsible user.

### 8. Spoilage & Wastage Management (`/wastage`)
- **Damaged & Spoiled Stock**: Log unsellable, rotten, crushed, or wilted vegetables.
- **Loss Cost Basis**: Automatically computes financial loss value using wholesale purchase unit cost.
- **Automatic Stock Deduction**: Deducts wasted quantity from inventory and logs audit movement.
- **Double-Counting Prevention**: Separate P&L accounting ensures wastage isn't counted twice.

### 9. Operating Expenses (`/expenses`)
- **Overhead Costs**: Track shop rent, cooling electricity, mandi freight/tempo, daily helper wages, and packaging bags.
- **Category Filtering**: Summaries and payment method breakdown (UPI, Cash, Bank).

### 10. Financial Profit & Loss Statement (`/reports`)
- **Audited Financial Reporting**:
  - **Gross Sales Revenue**
  - **Cost of Goods Sold (COGS)** (weighted cost basis at time of sale)
  - **Gross Operating Profit & Margin %**
  - **Operating Overheads**
  - **Wastage / Spoilage Loss**
  - **Estimated Net Operating Profit & Margin %**
- **Date Range Filters**: Filter statement by custom dates with instant recalculation.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Next.js 16+ (App Router, Server Components & Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom fresh green theme & print styling
- **Database**: **Official MongoDB Node.js Driver (`mongodb` v6+)**
  - Strict direct native driver usage via `MongoClient`, `Db`, `Collection`, `ObjectId`, and aggregation pipelines.
  - **Strictly NO Prisma, NO Mongoose, NO ORMs.**
  - Singleton client connection pooling cached in `src/lib/mongodb.ts`.
  - Native multi-document transactions when running on replica sets (Atlas), with safe atomic compensation fallback (`findOneAndUpdate` with `$gte` stock guard) on standalone instances.
- **Authentication**: Custom server-side authentication using **jose** (JWT cookies) & **bcryptjs** password hashing.
- **Icons & UI**: Lucide React, Sonner toasts, Recharts analytics.

---

## 🗄️ MongoDB Collections & Index Strategy

| Collection | Key Fields | Performance & Integrity Indexes |
|---|---|---|
| `users` | `name`, `email`, `passwordHash`, `role`, `isActive` | `{ email: 1 }` (unique), `{ role: 1 }` |
| `categories` | `name`, `slug`, `description`, `isActive` | `{ name: 1 }` (unique), `{ slug: 1 }` (unique) |
| `vegetables` | `name`, `sku`, `categoryId`, `unit`, `stockQuantity`, `minimumStock`, `purchasePrice`, `sellingPrice` | `{ sku: 1 }` (unique), `{ name: 1 }`, `{ categoryId: 1 }`, `{ isActive: 1, stockQuantity: 1 }` |
| `suppliers` | `name`, `phone`, `type`, `openingBalance`, `currentBalance` | `{ phone: 1 }`, `{ name: 1 }` |
| `customers` | `name`, `phone`, `creditLimit`, `outstandingBalance`, `isWalkIn` | `{ phone: 1 }`, `{ name: 1 }` |
| `purchases` | `invoiceNumber`, `supplierId`, `items`, `totalAmount`, `amountPaid`, `balanceDue`, `status` | `{ invoiceNumber: 1 }` (unique), `{ supplierId: 1 }`, `{ purchaseDate: -1 }`, `{ paymentStatus: 1 }` |
| `sales` | `invoiceNumber`, `customerId`, `items`, `totalAmount`, `amountPaid`, `paymentMethod`, `status` | `{ invoiceNumber: 1 }` (unique), `{ customerId: 1 }`, `{ createdAt: -1 }`, `{ paymentStatus: 1 }`, `{ createdAt: -1, status: 1 }` |
| `stock_movements` | `vegetableId`, `movementType`, `quantity`, `referenceInvoice`, `reason`, `userId` | `{ vegetableId: 1, createdAt: -1 }`, `{ movementType: 1 }`, `{ referenceId: 1 }` |
| `wastage` | `vegetableId`, `quantity`, `costBasis`, `totalLossValue`, `reason`, `date` | `{ date: -1 }`, `{ vegetableId: 1 }` |
| `expenses` | `categoryId`, `title`, `amount`, `paymentMethod`, `date` | `{ date: -1 }`, `{ categoryId: 1 }` |
| `expense_categories` | `name`, `description` | `{ name: 1 }` (unique) |
| `payments` | `type`, `entityId`, `amount`, `paymentMethod`, `date` | `{ entityId: 1, date: -1 }`, `{ type: 1 }` |
| `counters` | `_id`, `sequenceValue` | Sequential atomic invoice numbering |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Local MongoDB Server or MongoDB Atlas cluster connection string

### 2. Environment Configuration
Create `.env.local` in the project root:

```env
# MongoDB Native Driver Connection
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=vegi_shop

# Authentication Security
JWT_SECRET=super_secret_jwt_key_vegi_shop_dev_secure_token_987654321
SESSION_EXPIRY_HOURS=24

# Application Business Configuration
NEXT_PUBLIC_APP_NAME="VegiFresh Market"
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"
NEXT_PUBLIC_TIMEZONE="Asia/Kolkata"
```

### 3. Initialize Database & Indexes
Run the automated schema & indexing setup:

```bash
npm run init-db
```

### 4. Seed Realistic Indian Mandi Produce Data
Populate realistic vegetables (Tomato, Potato, Onion, Palak, Methi, Bhindi, etc.), suppliers, purchases, customers, sales, and accounts:

```bash
npm run seed
```

### 5. Start Application
```bash
# Development mode
npm run dev

# Or Production Build & Run
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) (or configured port) in your browser.

---

## 🔑 Demo Login Credentials

The seed script initializes two pre-configured accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin (Owner)** | `admin@vegifresh.com` | `admin123` | Full access: Pricing, inventory adjustments, purchase inward, reports, P&L statement, staff management. |
| **Staff (Cashier)** | `staff@vegifresh.com` | `staff123` | Counter operations: POS billing, customer search, produce catalog, recording wastage. |

*(The login screen also provides one-click Demo Login shortcut buttons for instant sign-in).*

---

## 🌐 MongoDB Atlas Setup Guide

To connect VegiFresh to a cloud MongoDB Atlas deployment:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a cluster (M0 Free tier or higher).
3. Under **Database Access**, create a database user with Read and Write privileges.
4. Under **Network Access**, whitelist your server's IP address (or `0.0.0.0/0` for cloud deployment).
5. Copy your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=vegi_shop
   ```
6. Run `npm run init-db` and `npm run seed` to initialize your cloud cluster with indexes and initial catalog data.
7. Atlas automatically runs as a replica set, enabling full multi-document transactions natively in the sales service.

---

## 🧪 Verification & Test Suite

Run the automated integration test script:

```bash
npx tsx src/scripts/test-api.ts
```

This verifies:
- Authenticated admin login and JWT token validation
- Live MongoDB aggregation metrics computation
- Produce catalog retrieval
- POS checkout with atomic stock deduction
- Stock audit ledger entry creation
- P&L statement recalculation
