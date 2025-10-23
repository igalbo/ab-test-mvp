import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Validation schema for experiment name (snake_case, lowercase only)
const experimentNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Name must be snake_case (lowercase letters, numbers, and underscores only)",
  );

// Validation schema for experiment status
const experimentStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
]);

export const experimentsRouter = createTRPCRouter({
  // List all experiments with variant counts
  list: publicProcedure.query(async ({ ctx }) => {
    const experiments = await ctx.db.experiment.findMany({
      include: {
        variants: {
          select: {
            id: true,
            key: true,
            weight: true,
          },
        },
        _count: {
          select: {
            variants: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return experiments;
  }),

  // Get single experiment by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const experiment = await ctx.db.experiment.findUnique({
        where: { id: input.id },
        include: {
          variants: true,
          _count: {
            select: {
              assignments: true,
            },
          },
        },
      });

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      return experiment;
    }),

  // Create new experiment
  create: publicProcedure
    .input(
      z.object({
        name: experimentNameSchema,
        status: experimentStatusSchema.default("draft"),
        strategy: z.string().default("uniform"),
        startAt: z.date().optional(),
        endAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if experiment with this name already exists
      const existing = await ctx.db.experiment.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new Error("Experiment with this name already exists");
      }

      return ctx.db.experiment.create({
        data: {
          name: input.name,
          status: input.status,
          strategy: input.strategy,
          startAt: input.startAt,
          endAt: input.endAt,
        },
      });
    }),

  // Update existing experiment
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: experimentNameSchema.optional(),
        status: experimentStatusSchema.optional(),
        strategy: z.string().optional(),
        startAt: z.date().nullable().optional(),
        endAt: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // If updating name, check it's not taken by another experiment
      if (updateData.name) {
        const existing = await ctx.db.experiment.findUnique({
          where: { name: updateData.name },
        });

        if (existing && existing.id !== id) {
          throw new Error("Experiment with this name already exists");
        }
      }

      return ctx.db.experiment.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete experiment
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.experiment.delete({
        where: { id: input.id },
      });
    }),
});
