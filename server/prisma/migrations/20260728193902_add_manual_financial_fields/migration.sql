-- AlterEnum
ALTER TYPE "DepositStatus" ADD VALUE 'REVERSED';

-- AlterEnum
ALTER TYPE "WithdrawalStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "customerReference" TEXT,
ADD COLUMN     "reviewDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "completionDate" TIMESTAMP(3);
