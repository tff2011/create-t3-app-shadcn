import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const riskPresetRouter = createTRPCRouter({
  // Get all risk presets for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.db.riskPreset.findMany({
      where: {
        userId,
      },
      orderBy: [
        { isDefault: "desc" }, // Default first
        { createdAt: "desc" }, // Then by creation date
      ],
    });
  }),

  // Get a specific risk preset
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const preset = await ctx.db.riskPreset.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!preset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Risk preset not found",
        });
      }

      return preset;
    }),

  // Get the default risk preset
  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.db.riskPreset.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }),

  // Create a new risk preset
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Preset name is required"),
        riskPercentage: z.number().positive("Risk percentage must be positive").max(10, "Risk percentage cannot exceed 10%"),
        maxDrawdown: z.number().positive("Max drawdown must be positive").max(50, "Max drawdown cannot exceed 50%"),
        maxOperations: z.number().int().positive("Max operations must be positive").max(20, "Max operations cannot exceed 20"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // If this is the first preset, make it default
      const existingPresets = await ctx.db.riskPreset.count({
        where: {
          userId,
        },
      });

      return ctx.db.riskPreset.create({
        data: {
          name: input.name,
          riskPercentage: input.riskPercentage,
          maxDrawdown: input.maxDrawdown,
          maxOperations: input.maxOperations,
          description: input.description,
          isDefault: existingPresets === 0, // First preset becomes default
          userId,
        },
      });
    }),

  // Update a risk preset
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Preset name is required"),
        riskPercentage: z.number().positive("Risk percentage must be positive").max(10, "Risk percentage cannot exceed 10%"),
        maxDrawdown: z.number().positive("Max drawdown must be positive").max(50, "Max drawdown cannot exceed 50%"),
        maxOperations: z.number().int().positive("Max operations must be positive").max(20, "Max operations cannot exceed 20"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Check if preset exists and belongs to user
      const existingPreset = await ctx.db.riskPreset.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existingPreset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Risk preset not found",
        });
      }

      return ctx.db.riskPreset.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          riskPercentage: input.riskPercentage,
          maxDrawdown: input.maxDrawdown,
          maxOperations: input.maxOperations,
          description: input.description,
        },
      });
    }),

  // Delete a risk preset
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Check if preset exists and belongs to user
      const existingPreset = await ctx.db.riskPreset.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existingPreset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Risk preset not found",
        });
      }

      // Cannot delete the default preset if there are other presets
      if (existingPreset.isDefault) {
        const otherPresets = await ctx.db.riskPreset.count({
          where: {
            userId,
            id: { not: input.id },
          },
        });

        if (otherPresets > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cannot delete default preset. Set another preset as default first.",
          });
        }
      }

      return ctx.db.riskPreset.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // Set a preset as default
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Check if preset exists and belongs to user
      const existingPreset = await ctx.db.riskPreset.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existingPreset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Risk preset not found",
        });
      }

      // Use a transaction to update all presets atomically
      return ctx.db.$transaction(async (tx) => {
        // Remove default from all presets
        await tx.riskPreset.updateMany({
          where: {
            userId,
          },
          data: {
            isDefault: false,
          },
        });

        // Set the selected preset as default
        return tx.riskPreset.update({
          where: {
            id: input.id,
          },
          data: {
            isDefault: true,
          },
        });
      });
    }),

  // Calculate risk amount based on preset and account balance
  calculateRisk: protectedProcedure
    .input(
      z.object({
        presetId: z.string(),
        accountBalance: z.number().positive("Account balance must be positive"),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const preset = await ctx.db.riskPreset.findFirst({
        where: {
          id: input.presetId,
          userId,
        },
      });

      if (!preset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Risk preset not found",
        });
      }

      // Calculate risk amount in USD
      const riskAmount = (input.accountBalance * Number(preset.riskPercentage)) / 100;

      return {
        preset: preset,
        riskAmount: riskAmount,
        riskPercentage: Number(preset.riskPercentage),
        maxDrawdown: Number(preset.maxDrawdown),
        maxOperations: preset.maxOperations,
      };
    }),
});
