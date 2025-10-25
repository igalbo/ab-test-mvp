import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";

// Simple hash function for consistent assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Core assignment logic - gets existing assignment or creates a new one
 * This function implements sticky hash-based assignment
 */
async function getOrCreateAssignment(
  db: PrismaClient,
  userId: string,
  experimentId: string,
): Promise<{ variantKey: string; isNew: boolean }> {
  // Check if assignment already exists
  const existingAssignment = await db.assignment.findUnique({
    where: {
      experimentId_userId: {
        experimentId,
        userId,
      },
    },
  });

  if (existingAssignment) {
    return {
      variantKey: existingAssignment.variantKey,
      isNew: false,
    };
  }

  // Get experiment with variants
  const experiment = await db.experiment.findUnique({
    where: { id: experimentId },
    include: {
      variants: {
        orderBy: { key: "asc" },
      },
    },
  });

  if (!experiment) {
    throw new Error("Experiment not found");
  }

  if (experiment.variants.length === 0) {
    throw new Error(
      `Experiment "${experiment.name}" has no variants configured. Please add at least 2 variants before assigning users.`,
    );
  }

  // Calculate hash-based assignment
  const hashInput = `${userId}:${experiment.name}`;
  const hash = hashString(hashInput);
  const variantIndex = hash % experiment.variants.length;
  const selectedVariant = experiment.variants[variantIndex]!;

  // Create user if doesn't exist
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  // Create and store the assignment
  const assignment = await db.assignment.create({
    data: {
      experimentId,
      userId,
      variantKey: selectedVariant.key,
    },
  });

  return {
    variantKey: assignment.variantKey,
    isNew: true,
  };
}

const assignmentInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  experimentId: z.string().min(1, "Experiment ID is required"),
});

export const assignmentsRouter = createTRPCRouter({
  // Get existing assignment or create a new one (sticky assignment)
  get: publicProcedure
    .input(assignmentInputSchema)
    .query(async ({ ctx, input }) => {
      return getOrCreateAssignment(ctx.db, input.userId, input.experimentId);
    }),

  // Assign a user to a variant (same as get, but explicitly mutation)
  assign: publicProcedure
    .input(assignmentInputSchema)
    .mutation(async ({ ctx, input }) => {
      return getOrCreateAssignment(ctx.db, input.userId, input.experimentId);
    }),

  // List all assignments for an experiment
  listByExperiment: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.assignment.findMany({
        where: {
          experimentId: input.experimentId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // List all assignments for a user
  listByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.assignment.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          experiment: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
