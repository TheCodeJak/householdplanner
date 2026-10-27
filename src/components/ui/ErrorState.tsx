import { describeError } from "@/lib/describeError";
import { Button } from "jaklib/core";
import Link from "next/link";
import { StatusMessage } from "./StatusMessage";

/**
 * Ganzseitige Fehlermeldung für eine fehlgeschlagene Anfrage. Wählt Text und
 * passenden nächsten Schritt: neu laden, neu anmelden oder Familie wählen.
 */
export function ErrorState({
  error,
  onRetry,
}: {
  error: Parameters<typeof describeError>[0];
  onRetry: () => void;
}) {
  const info = describeError(error);

  const action =
    info.kind === "session" ? (
      <Link href="/login" className="font-semibold text-accent">
        Zur Anmeldung
      </Link>
    ) : info.kind === "family" ? (
      <Link href="/onboarding" className="font-semibold text-accent">
        Familie einrichten
      </Link>
    ) : (
      <Button onClick={onRetry}>Erneut versuchen</Button>
    );

  return (
    <StatusMessage
      kind={info.kind}
      title={info.title}
      text={info.text}
      action={action}
    />
  );
}
