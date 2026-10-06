import { toIsoDate } from "@/lib/dateUtils";
import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

export function useDayPlan(date: Date) {
  const { data, isLoading, error } = trpc.plan.getDay.useQuery(
    {
      date: toIsoDate(date),
    },
    { placeholderData: keepPreviousData, refetchInterval: 20_000 },
  );
  return { tasks: data ?? [], isLoading, error };
}
