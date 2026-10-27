import { trpc } from "@/lib/trpc";

/**
 * Die Familie des angemeldeten Nutzers (Name, Einladungscode, Mitglieder,
 * Wochenstatistik) für die Profilseite.
 */
export function useFamily() {
  const { data, isLoading, error, refetch } = trpc.family.overview.useQuery();
  return { family: data, isLoading, error, refetch };
}

/** Neuen Einladungscode erzeugen (nur Admins); danach lädt die Übersicht neu */
export function useRegenerateInviteCode() {
  const utils = trpc.useUtils();
  const mutation = trpc.family.regenerateInviteCode.useMutation({
    onSettled: () => {
      void utils.family.overview.invalidate();
    },
  });
  return {
    regenerate: () => mutation.mutate(),
    isPending: mutation.isPending,
    // Der ganze Fehler, damit describeError() ihn einordnen kann
    error: mutation.error,
    reset: mutation.reset,
  };
}
