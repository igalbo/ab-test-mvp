import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Validation schema for variant
const variantSchema = z.object({
  key: z
    .string()
    .min(1, "Variant key is required")
    .max(50, "Variant key must be less than 50 characters"),
  weight: z
    .number()
    .int()
    .min(0, "Weight must be at least 0")
    .max(100, "Weight must be at most 100"),
});

export const variantsRouter = createTRPCRouter({
  // List all variants for an experiment
  list: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.variant.findMany({
        where: {
          experimentId: input.experimentId,
        },
        orderBy: {
          key: "asc",
        },
      });
    }),

  // Upsert multiple variants for an experiment
  upsertMany: publicProcedure
    .input(
      z.object({
        experimentId: z.string(),
        variants: z
          .array(variantSchema)
          .min(2, "Experiment must have at least 2 variants"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { experimentId, variants } = input;

      // Verify experiment exists
      const experiment = await ctx.db.experiment.findUnique({
        where: { id: experimentId },
      });

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      // Check for duplicate keys
      const keys = variants.map((v) => v.key);
      const uniqueKeys = new Set(keys);
      if (keys.length !== uniqueKeys.size) {
        throw new Error("Duplicate variant keys are not allowed");
      }

      // Delete existing variants and create new ones in a transaction
      await ctx.db.$transaction(async (tx) => {
        // Delete all existing variants for this experiment
        await tx.variant.deleteMany({
          where: { experimentId },
        });

        // Create new variants
        await tx.variant.createMany({
          data: variants.map((variant) => ({
            experimentId,
            key: variant.key,
            weight: variant.weight,
          })),
        });
      });

      // Return the updated variants
      return ctx.db.variant.findMany({
        where: { experimentId },
        orderBy: { key: "asc" },
      });
    }),

  // Delete a single variant
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if this is the last variant (need at least 2)
      const variant = await ctx.db.variant.findUnique({
        where: { id: input.id },
        include: {
          experiment: {
            include: {
              _count: {
                select: { variants: true },
              },
            },
          },
        },
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      if (variant.experiment._count.variants <= 2) {
        throw new Error(
          "Cannot delete variant: experiment must have at least 2 variants",
        );
      }

      return ctx.db.variant.delete({
        where: { id: input.id },
      });
    }),
});
