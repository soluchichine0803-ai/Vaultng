# Prisma Migration & Database Lifecycle Strategy

This document outlines the rebuilt Prisma migration strategy, deployment procedures, and recovery paths for existing databases. It serves as a guide to ensure deterministic deployments and eliminate database drift.

---

## 1. Rebuilt Migration Lineage

To support bootstrapping an empty PostgreSQL database from scratch while preserving the historical incremental changes, we rebuilt the migration lineage by introducing a proper baseline migration (`20260612000000_init`).

The migration history now consists of the following canonical, sequential migrations:

1. **`20260612000000_init`** (Baseline)
   - Creates the initial schema including the core tables (`User`, `InvestmentPlan`, `Investment`, `Deposit`, `Withdrawal`, `Referral`, `Banner`, `AdminLog`, `Notification`, and `SystemSettings`) along with their respective enums, indexes, foreign keys, and defaults.
2. **`20260613143800_add_investment_snapshots`** (Incremental)
   - Adds the snapshots `durationHoursSnapshot` and `roiPercentSnapshot` to the `Investment` model.
3. **`20260618184554_add_wallet_and_transactions`** (Incremental)
   - Creates the `Transaction` table and `TransactionType` / `TransactionStatus` enums.
   - Renames the user's `balance` column to `availableBalance` and adds the `lockedBalance` column with default value of `0`.
4. **`20260714000000_add_deposit_system`** (Incremental)
   - Introduces the unique `reference` column to the `Deposit` model and adds index constraints.

---

## 2. Bootstrapping a Fresh Database (Render & Local)

A brand-new database (either locally or on Render) is bootstrapped entirely from scratch without requiring `prisma db push` or manual SQL scripts.

### Step-by-Step Command Sequence:
Inside the `server` directory, run:
```bash
# Install server dependencies
npm install

# Generate Prisma Client matching the current database schema
npx prisma generate

# Apply all migrations sequentially from scratch
npx prisma migrate deploy

# Compile the Express server TypeScript source files to JavaScript
npm run build

# Run the idempotent seed script to populate initial records
npx prisma db seed
```

This sequence is fully automated within the Render deployment script inside `server/package.json` under `"deploy"`.

---

## 3. Aligning and Recovering an Existing Database

If your database is already populated with data and matches the current schema, running the newly introduced baseline migration (`20260612000000_init`) directly will fail because the tables already exist.

To resolve this without data loss, follow Prisma's officially supported migration baselining workflow to mark migrations as applied.

### Steps for baselining an existing database:

1. **Mark the baseline as applied**:
   Since the database already has the initial tables, mark the `20260612000000_init` migration as applied without running its SQL:
   ```bash
   npx prisma migrate resolve --applied 20260612000000_init
   ```

2. **Verify subsequent migrations**:
   - If the subsequent schema changes are also already present in your database, mark them as applied sequentially as well:
     ```bash
     npx prisma migrate resolve --applied 20260613143800_add_investment_snapshots
     npx prisma migrate resolve --applied 20260618184554_add_wallet_and_transactions
     npx prisma migrate resolve --applied 20260714000000_add_deposit_system
     ```
   - If the schema changes are *not* yet present, run `npx prisma migrate deploy` to safely apply the remaining pending migrations.

Once all migrations are marked as resolved/applied, run `npx prisma migrate status` to confirm the database migration state is completely healthy and up to date.

---

## 4. Seeding Idempotency

The seeding engine (`server/prisma/seed.ts`) is designed to be fully idempotent. It can be executed safely multiple times against any database without producing duplicate records:

- **Admin User**: Created or verified using `prisma.user.upsert` keyed on the `username` field.
- **Investment Plans**: Syncs `Package A` and `Package B` via `upsert` keyed on the plan `id`. Deactivates legacy plans while preserving historical data.
- **System Settings**: Created only if no settings exist, preventing overriding of user settings.
- **Sample Banners**: Created only if no banners exist in the database.

---

## 5. Future Migration Guidelines

To prevent migration drift, lineage issues, and production downtime in the future, adhere to the following best practices:

- **Never edit applied migration files**: If a schema change is needed, always create a new incremental migration using `npx prisma migrate dev`.
- **Do not use `prisma db push` in production**: Use `prisma migrate deploy` to deploy schema changes safely and sequentially.
- **Automated Deployments**: Ensure the deploy command runs migrations before compiling TypeScript or starting the web server.
