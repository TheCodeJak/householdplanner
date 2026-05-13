"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/app/api/trpc/routers/_app";

export const trpc = createTRPCReact<AppRouter>();
