
import {
  publicProcedure,
  router,
} from "../lib/trpc";
import { personRouter } from '@/routers/person'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  person: personRouter,
});
export type AppRouter = typeof appRouter;
