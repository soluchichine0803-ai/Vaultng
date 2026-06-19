-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN "reference" TEXT;

-- Update existing records with a temporary unique reference
UPDATE "Deposit" SET "reference" = 'LEGACY-' || id WHERE "reference" IS NULL;

-- Make reference NOT NULL and add unique constraint
ALTER TABLE "Deposit" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "Deposit_reference_key" ON "Deposit"("reference");

-- CreateIndex
CREATE INDEX "Deposit_reference_idx" ON "Deposit"("reference");

-- Set default for method if it doesn't have one
ALTER TABLE "Deposit" ALTER COLUMN "method" SET DEFAULT 'MANUAL';
