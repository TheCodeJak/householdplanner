"use client";

import { useActionState } from "react";
import { Button, TextField } from "jaklib/core";
import { registerAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Name"
        name="name"
        type="text"
        required
        autoComplete="name"
        defaultValue={state.name}
      />
      <TextField
        label="E-Mail"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state.email}
      />
      <TextField
        label="Passwort"
        name="password"
        type="password"
        required
        autoComplete="new-password"
      />
      {state.error && (
        <p role="alert" className="text-sm text-error-600">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={pending}
      >
        Konto erstellen
      </Button>
    </form>
  );
}
