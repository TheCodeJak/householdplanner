"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/shared/button";
import { Input } from "@/app/components/shared/input";
import { registerAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Name"
        id="name"
        name="name"
        type="text"
        required
        autoComplete="name"
        defaultValue={state.name}
      />
      <Input
        label="E-Mail"
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state.email}
      />
      <Input
        label="Passwort"
        id="password"
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
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        Konto erstellen
      </Button>
    </form>
  );
}
