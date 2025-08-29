import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
type OperationWithLiquidation = {
  liquidation?: { balanceInPips: unknown; profitOrLoss?: string } | null;
};

export const backtestRouter = createTRPCRouter({
  // Estratégias
  createStrategy: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        userId: z.string(),
        operationTypes: z.array(z.string()).optional(),
        entrySignals: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      // Criar usuário se não existir
      await db.user.upsert({
        where: { id: input.userId },
        update: {},
        create: {
          id: input.userId,
          name: "Demo User",
          email: `${input.userId}@demo.com`,
        },
      });

      return db.backtestStrategy.create({
        data: {
          name: input.name,
          description: input.description,
          userId: input.userId,
          operationTypes: input.operationTypes ?? [],
          entrySignals: input.entrySignals ?? [],
        },
      });
    }),

  getStrategies: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db as any;
      // Criar usuário se não existir
      await db.user.upsert({
        where: { id: input.userId },
        update: {},
        create: {
          id: input.userId,
          name: "Demo User",
          email: `${input.userId}@demo.com`,
        },
      });

      return db.backtestStrategy.findMany({
        where: { userId: input.userId },
        include: {
          operations: {
            include: {
              riskManagement: true,
              liquidation: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Operações
  createOperation: publicProcedure
    .input(
      z.object({
        strategyId: z.string(),
        operationNumber: z.number(),
        currency: z.string(),
        date: z.date(),
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
        buySell: z.enum(["Buy", "Sell"]),
        operationType: z.string(),
        entryPrice: z.number(),
        entrySignal: z.string().optional(),
        dailyAtrPercentPips: z.number().optional(),
        tradingAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      // Calculate day of week and week number automatically
      const dayOfWeek = input.date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Calculate week number (ISO week)
      const startDate = new Date(input.date.getFullYear(), 0, 1);
      const days = Math.floor((input.date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);

      return db.operation.create({
        data: {
          ...input,
          dayOfWeek,
          weekNumber,
          entryPrice: input.entryPrice,
          dailyAtrPercentPips: input.dailyAtrPercentPips,
        },
      });
    }),

  // Gerenciamento de Risco
  createRiskManagement: publicProcedure
    .input(
      z.object({
        operationId: z.string(),
        entryQuotation: z.number(),
        profitPotentialRef: z.string().optional(),
        profitPotentialQuotation: z.number().optional(),
        profitPotentialSize: z.number().optional(),
        stopReference: z.string().optional(),
        stopQuotation: z.number(),
        stopSize: z.number(),
        enteredOperation: z.boolean().default(false),
        accountBalance: z.number(),
        lotQuantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      return db.riskManagement.create({
        data: {
          ...input,
          entryQuotation: input.entryQuotation,
          profitPotentialRef: input.profitPotentialRef,
          profitPotentialQuotation: input.profitPotentialQuotation,
          profitPotentialSize: input.profitPotentialSize,
          stopReference: input.stopReference,
          stopQuotation: input.stopQuotation,
          stopSize: input.stopSize,
          accountBalance: input.accountBalance,
          lotQuantity: input.lotQuantity,
        },
      });
    }),

  // Liquidação
  createLiquidation: publicProcedure
    .input(
      z.object({
        operationId: z.string(),
        liquidationDate: z.date(),
        liquidationHour: z.number().min(0).max(23),
        liquidationMinute: z.number().min(0).max(59),
        liquidationQuotation: z.number(),
        balanceInPips: z.number(),
        liquidationProportion: z.number(),
        profitOrLoss: z.enum(["PROFIT", "LOSS", "BREAK_EVEN"]),
        operationRisk: z.number(),
        liquidationReason: z.string().optional(),
        liquidationType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      return db.liquidation.create({
        data: {
          ...input,
          liquidationQuotation: input.liquidationQuotation,
          balanceInPips: input.balanceInPips,
          liquidationProportion: input.liquidationProportion,
          operationRisk: input.operationRisk,
        },
      });
    }),

  // Delete Strategy
  deleteStrategy: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      return db.backtestStrategy.delete({
        where: { id: input.id },
      });
    }),

  // Update Strategy
  updateStrategy: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      operationTypes: z.array(z.string()).optional(),
      entrySignals: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;

      // Build the update data object
      const updateData: any = {
        name: input.name,
        description: input.description,
      };

      // Add array fields only if they are provided and not undefined
      if (input.operationTypes !== undefined) {
        updateData.operationTypes = input.operationTypes;
      }
      if (input.entrySignals !== undefined) {
        updateData.entrySignals = input.entrySignals;
      }

      return db.backtestStrategy.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  // Delete Operation
  deleteOperation: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      return db.operation.delete({
        where: { id: input.id },
      });
    }),

  // Update Operation
  updateOperation: publicProcedure
    .input(z.object({
      id: z.string(),
      currency: z.string(),
      date: z.date(),
      hour: z.number().min(0).max(23),
      minute: z.number().min(0).max(59),
      buySell: z.enum(["Buy", "Sell"]),
      operationType: z.string(),
      entryPrice: z.number(),
      entrySignal: z.string().optional(),
      dailyAtrPercentPips: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as any;
      // Calculate day of week and week number automatically
      const dayOfWeek = input.date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Calculate week number (ISO week)
      const startDate = new Date(input.date.getFullYear(), 0, 1);
      const days = Math.floor((input.date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);

      return db.operation.update({
        where: { id: input.id },
        data: {
          currency: input.currency,
          date: input.date,
          hour: input.hour,
          minute: input.minute,
          dayOfWeek,
          weekNumber,
          buySell: input.buySell,
          operationType: input.operationType,
          entryPrice: input.entryPrice,
          entrySignal: input.entrySignal,
          dailyAtrPercentPips: input.dailyAtrPercentPips,
        },
      });
    }),

  // Buscar operações de uma estratégia
  getOperations: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db as any;
      return db.operation.findMany({
        where: { strategyId: input.strategyId },
        include: {
          riskManagement: true,
          liquidation: true,
        },
        orderBy: { date: "desc" },
      });
    }),

  // Estatísticas da estratégia
  getStrategyStats: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db as any;
      const operations = await db.operation.findMany({
        where: { strategyId: input.strategyId },
        include: {
          liquidation: true,
        },
      }) as OperationWithLiquidation[];

      const totalOperations = operations.length;
      const completedOperations = operations.filter((op) => op.liquidation).length;
      const profitOperations = operations.filter((op) => op.liquidation?.profitOrLoss === "GANHO").length;
      const lossOperations = operations.filter((op) => op.liquidation?.profitOrLoss === "PERDA").length;
      
      const totalPips = operations.reduce((acc, op) => {
        if (op.liquidation && op.liquidation.balanceInPips != null) {
          return acc + Number((op.liquidation as any).balanceInPips);
        }
        return acc;
      }, 0);

      const winRate = completedOperations > 0 ? (profitOperations / completedOperations) * 100 : 0;

      return {
        totalOperations,
        completedOperations,
        profitOperations,
        lossOperations,
        totalPips,
        winRate,
      };
    }),
});