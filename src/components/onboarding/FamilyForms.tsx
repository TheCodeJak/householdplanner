"use client";

import { Button, TextField } from "jaklib/core";
import { useState } from "react";
import { INVITE_CODE_LENGTH } from "@/lib/inviteCode";
import { InviteCodeInput } from "./InviteCodeInput";

/**
 * Die beiden Formulare des Onboardings. Sie kennen nur ihre Felder: Was beim
 * Absenden passiert, regelt die Seite (`onSubmit`), ebenso `pending` und
 * `error`.
 */

/** Neue Familie gründen: nur ein Name */
export function CreateFamilyForm({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (name: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const valid = name.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !pending) onSubmit(name.trim());
      }}
      className="flex flex-col gap-4"
    >
      <TextField
        label="Name der Familie"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="z. B. Familie Müller"
        maxLength={60}
        autoComplete="off"
        required
      />
      {error && (
        <p role="alert" className="text-secondary text-danger">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        loading={pending}
        disabled={!valid || pending}
      >
        Familie gründen
      </Button>
    </form>
  );
}

/** Einer Familie beitreten: der Code, den jemand aus der Familie geschickt hat */
export function JoinFamilyForm({
  onSubmit,
  onEdit,
  pending,
  error,
}: {
  onSubmit: (code: string) => void;
  /** Der Nutzer tippt weiter: Zeit, eine alte Fehlermeldung auszublenden */
  onEdit?: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState("");
  const valid = code.length === INVITE_CODE_LENGTH;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !pending) onSubmit(code);
      }}
      className="flex flex-col gap-4"
    >
      <InviteCodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          onEdit?.();
        }}
        error={error}
        disabled={pending}
      />
      <Button
        type="submit"
        className="w-full"
        loading={pending}
        disabled={!valid || pending}
      >
        Beitreten
      </Button>
    </form>
  );
}
