import { postRouter } from "@/server/api/routers/post";
import { backtestRouter } from "@/server/api/routers/backtest";
import { tradingAccountRouter } from "@/server/api/routers/tradingAccount";
import { riskPresetRouter } from "@/server/api/routers/riskPreset";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  backtest: backtestRouter,
  tradingAccount: tradingAccountRouter,
  riskPreset: riskPresetRouter,
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
