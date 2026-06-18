-- AlterTable
ALTER TABLE "Investment" ADD COLUMN "durationHoursSnapshot" INTEGER NOT NULL,
ADD COLUMN "roiPercentSnapshot" DECIMAL(5,2) NOT NULL;
