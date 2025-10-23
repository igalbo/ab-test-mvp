import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { experimentsRouter } from "~/server/api/routers/experiments";
import { variantsRouter } from "~/server/api/routers/variants";
import { assignmentsRouter } from "~/server/api/routers/assignments";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  experiments: experimentsRouter,
  variants: variantsRouter,
  assignments: assignmentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
