import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  // List all users
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
