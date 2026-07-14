# Prisma Migration Recovery Guide (P3009 Error in Production)

This guide provides the exact root cause, safest recovery procedures, CLI commands, fallback SQL, and validation steps to resolve the **P3009** migration failure in the production database (Render) and restore a healthy Prisma migration state.

---

## 1. Exact Root Cause

The **P3009** error on Render occurs due to a mismatch between the failed migration record stored in the production database's `_prisma_migrations` table and the migration folders present in the Git repository's codebase.

### Timeline of the Mismatch:
1. **Initial Migration:** A migration was generated in the codebase under the folder name `20240618000000_add_wallet_and_transactions`.
2. **Production Failure:** During a previous deployment on Render, Prisma started executing this migration. For some reason (e.g., timeout, pre-existing columns, or transient database issues), the migration execution failed or was interrupted.
   - This left a failed record in the `_prisma_migrations` table with `migration_name = '20240618000000_add_wallet_and_transactions'` and `finished_at = NULL`.
3. **Repository Renaming:** In a later commit to resolve chronology (since `20240618000000` pre-dated `20260613143800_add_investment_snapshots` but was applied after it), the folder in Git was renamed to `20260618184554_add_wallet_and_transactions`.
4. **The P3009 Block:**
   - When a new deployment is triggered on Render, `npx prisma migrate deploy` runs.
   - Prisma scans the database and finds that `20240618000000_add_wallet_and_transactions` failed.
   - It looks for a folder of the exact same name in `server/prisma/migrations/` to inspect it.
   - Because the folder has been renamed to `20260618184554_add_wallet_and_transactions`, Prisma cannot find it.
   - Prisma halts immediately with the error:
     ```
     P3009: The migration 20240618000000_add_wallet_and_transactions is failed, but cannot be found in the migrations directory.
     ```

---

## 2. Safest Recovery Procedures

Depending on your preference for folder names in Git, there are two distinct, production-safe recovery strategies.

### Path A: 100% Prisma-Native CLI (Recommended & Safest)
*No manual SQL editing of `_prisma_migrations` is required. We temporarily restore the folder name in Git to match the database record, resolve the failure natively, and then apply future migrations.*

#### Step 1: Temporarily Rename the Folder in your Git repository
Rename the migration folder back to its original name in Git:
```bash
# From the repository root:
mv server/prisma/migrations/20260618184554_add_wallet_and_transactions server/prisma/migrations/20240618000000_add_wallet_and_transactions
```

#### Step 2: Determine if Schema Changes are Already in the Database
Connect to your production PostgreSQL database and check if the `Transaction` table and the `availableBalance` column already exist on the `User` table.

- **Case 1: Schema changes ARE already applied** (the table `Transaction` exists and the `User` table has the `availableBalance` column).
  Run the following Prisma CLI command to mark the migration as successfully applied:
  ```bash
  npx prisma migrate resolve --applied 20240618000000_add_wallet_and_transactions
  ```

- **Case 2: Schema changes ARE NOT applied** (the table `Transaction` does not exist and the `User` table still has the old `balance` column).
  Run the following Prisma CLI command to mark the migration as rolled back:
  ```bash
  npx prisma migrate resolve --rolled-back 20240618000000_add_wallet_and_transactions
  ```
  Then deploy migrations normally so Prisma can attempt to execute the SQL again:
  ```bash
  npx prisma migrate deploy
  ```

#### Step 3: Permanent Alignment (Optional but Recommended)
Once the migration state is resolved and healthy, you can permanently keep the folder name as `20240618000000_add_wallet_and_transactions`. Prisma supports out-of-order migrations during deployment and will not block your CI/CD pipelines.

---

### Path B: SQL-Assisted Recovery (If keeping the `20260618184554...` name is preferred)
*If you prefer to keep the migration folder named `20260618184554_add_wallet_and_transactions` in Git to maintain chronological cleanliness in your repository, you must remove the failed old record via SQL and resolve the new record via Prisma CLI.*

#### Step 1: Delete the Failed Record from the Database
Connect to your production PostgreSQL database (using `psql` or any GUI client like pgAdmin, DBeaver, or Render's database console) and run:
```sql
DELETE FROM _prisma_migrations WHERE migration_name = '20240618000000_add_wallet_and_transactions';
```
*This removes the failed reference that Prisma is complaining about.*

#### Step 2: Resolve the New Migration Name
Now, Prisma only sees the folder `20260618184554_add_wallet_and_transactions` in Git.

- **Case 1: Schema changes ARE already applied in the database.**
  We must tell Prisma that the new `20260618184554_add_wallet_and_transactions` migration is already done so it doesn't try to create tables that already exist. Run:
  ```bash
  npx prisma migrate resolve --applied 20260618184554_add_wallet_and_transactions
  ```

- **Case 2: Schema changes ARE NOT applied in the database.**
  Since the database is clean, simply run the standard deploy command to execute the migration:
  ```bash
  npx prisma migrate deploy
  ```

---

## 3. Validation Steps

To guarantee that your recovery was 100% successful and future deployments will proceed normally, run the following commands in order:

### 1. Check Migration Status
Run the status command in your production environment (or locally against a staging copy of the DB):
```bash
npx prisma migrate status
```
**Expected Output:**
- It should report that the database is up-to-date or list any pending migrations (like `20260714000000_add_deposit_system`).
- It **must not** display any "failed migration" errors.

### 2. Run Migration Deploy
Execute the deployment command:
```bash
npx prisma migrate deploy
```
**Expected Output:**
- Any pending migrations (e.g. `20260714000000_add_deposit_system`) are successfully applied.
- Returns exit code `0` (Success).

### 3. Verify Database Seed (Idempotency)
If your Render deployment pipeline includes a seeding step, run the seed command to ensure data integrity:
```bash
npx prisma db seed
```
**Expected Output:**
- Seeding completes successfully without trying to recreate pre-existing records or throwing unique constraint violations.

---

## Summary Checklist for Render Deployment

Once you have performed the recovery using either **Path A** or **Path B**, verify that your Render environment variables are correctly configured and trigger a fresh manual deployment with **Clear Build Cache**. Your build and deploy pipeline will now run to completion smoothly.
