"use client";

import type { AppRouter } from "@/app/api/trpc/routers/_app";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
