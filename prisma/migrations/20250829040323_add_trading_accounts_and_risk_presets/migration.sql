/*
  Warnings:

  - You are about to drop the column `accountBalance` on the `RiskManagement` table. All the data in the column will be lost.
  - You are about to drop the column `lotQuantity` on the `RiskManagement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "accountBalance" DECIMAL(12,2),
ADD COLUMN     "lotQuantity" DECIMAL(8,2),
ADD COLUMN     "tradingAccountId" TEXT;

-- AlterTable
ALTER TABLE "RiskManagement" DROP COLUMN "accountBalance",
DROP COLUMN "lotQuantity";

-- CreateTable
CREATE TABLE "TradingAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TradingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riskPercentage" DECIMAL(5,2) NOT NULL,
    "maxDrawdown" DECIMAL(5,2) NOT NULL,
    "maxOperations" INTEGER NOT NULL DEFAULT 5,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RiskPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradingAccount_userId_idx" ON "TradingAccount"("userId");

-- CreateIndex
CREATE INDEX "TradingAccount_isActive_idx" ON "TradingAccount"("isActive");

-- CreateIndex
CREATE INDEX "RiskPreset_userId_idx" ON "RiskPreset"("userId");

-- CreateIndex
CREATE INDEX "RiskPreset_isDefault_idx" ON "RiskPreset"("isDefault");

-- CreateIndex
CREATE INDEX "Operation_tradingAccountId_idx" ON "Operation"("tradingAccountId");

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_tradingAccountId_fkey" FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskPreset" ADD CONSTRAINT "RiskPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
