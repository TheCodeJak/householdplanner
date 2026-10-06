import { auth } from "@/lib/auth";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../routers/_app";

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => {
      const session = await auth();
      return { session };
    },
  });

export { handler as GET, handler as POST };
