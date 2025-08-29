import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const tradingAccountRouter = createTRPCRouter({
  // Get all trading accounts for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tradingAccount.findMany({
      where: {
        userId: ctx.session!.user.id,
      },
      include: {
        _count: {
          select: {
            operations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get a specific trading account
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.tradingAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.session!.user.id,
        },
        include: {
          _count: {
            select: {
              operations: true,
            },
          },
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading account not found",
        });
      }

      return account;
    }),

  // Create a new trading account
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Account name is required"),
        balance: z.number().positive("Balance must be positive"),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tradingAccount.create({
        data: {
          name: input.name,
          balance: input.balance,
          currency: input.currency,
          userId: ctx.session!.user.id,
        },
      });
    }),

  // Update a trading account
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Account name is required"),
        balance: z.number().positive("Balance must be positive"),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if account exists and belongs to user
      const existingAccount = await ctx.db.tradingAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.session!.user.id,
        },
      });

      if (!existingAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading account not found",
        });
      }

      return ctx.db.tradingAccount.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          balance: input.balance,
          currency: input.currency,
        },
      });
    }),

  // Delete a trading account
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if account exists and belongs to user
      const existingAccount = await ctx.db.tradingAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.session!.user.id,
        },
      });

      if (!existingAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading account not found",
        });
      }

      // Check if account has operations
      const operationsCount = await ctx.db.operation.count({
        where: {
          tradingAccountId: input.id,
        },
      });

      if (operationsCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete account with existing operations",
        });
      }

      return ctx.db.tradingAccount.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // Toggle account active/inactive status
  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if account exists and belongs to user
      const existingAccount = await ctx.db.tradingAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.session!.user.id,
        },
      });

      if (!existingAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading account not found",
        });
      }

      return ctx.db.tradingAccount.update({
        where: {
          id: input.id,
        },
        data: {
          isActive: input.isActive,
        },
      });
    }),

  // Get active accounts for dropdown selection
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tradingAccount.findMany({
      where: {
        userId: ctx.session!.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        balance: true,
        currency: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
});
