-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "BacktestStrategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "operationTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entrySignals" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "BacktestStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "operationNumber" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "dayOfWeek" TEXT,
    "weekNumber" INTEGER,
    "buySell" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "entryPrice" DECIMAL(10,5) NOT NULL,
    "entrySignal" TEXT,
    "dailyAtrPercentPips" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "strategyId" TEXT NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskManagement" (
    "id" TEXT NOT NULL,
    "entryQuotation" DECIMAL(10,5) NOT NULL,
    "profitPotentialRef" TEXT,
    "profitPotentialQuotation" DECIMAL(10,5),
    "profitPotentialSize" DECIMAL(8,2),
    "stopReference" TEXT,
    "stopQuotation" DECIMAL(10,5) NOT NULL,
    "stopSize" DECIMAL(8,2) NOT NULL,
    "enteredOperation" BOOLEAN NOT NULL DEFAULT false,
    "accountBalance" DECIMAL(12,2) NOT NULL,
    "lotQuantity" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "RiskManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liquidation" (
    "id" TEXT NOT NULL,
    "liquidationDate" TIMESTAMP(3) NOT NULL,
    "liquidationHour" INTEGER NOT NULL,
    "liquidationMinute" INTEGER NOT NULL,
    "liquidationQuotation" DECIMAL(10,5) NOT NULL,
    "balanceInPips" DECIMAL(8,2) NOT NULL,
    "liquidationProportion" DECIMAL(5,2) NOT NULL,
    "profitOrLoss" TEXT NOT NULL,
    "operationRisk" DECIMAL(5,2) NOT NULL,
    "liquidationReason" TEXT,
    "liquidationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "Liquidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "BacktestStrategy_userId_idx" ON "BacktestStrategy"("userId");

-- CreateIndex
CREATE INDEX "Operation_strategyId_idx" ON "Operation"("strategyId");

-- CreateIndex
CREATE INDEX "Operation_operationNumber_idx" ON "Operation"("operationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RiskManagement_operationId_key" ON "RiskManagement"("operationId");

-- CreateIndex
CREATE INDEX "RiskManagement_operationId_idx" ON "RiskManagement"("operationId");

-- CreateIndex
CREATE UNIQUE INDEX "Liquidation_operationId_key" ON "Liquidation"("operationId");

-- CreateIndex
CREATE INDEX "Liquidation_operationId_idx" ON "Liquidation"("operationId");

-- CreateIndex
CREATE INDEX "Liquidation_profitOrLoss_idx" ON "Liquidation"("profitOrLoss");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacktestStrategy" ADD CONSTRAINT "BacktestStrategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BacktestStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskManagement" ADD CONSTRAINT "RiskManagement_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidation" ADD CONSTRAINT "Liquidation_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
