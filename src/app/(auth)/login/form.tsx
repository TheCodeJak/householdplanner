"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/shared/button";
import { Input } from "@/app/components/shared/input";
import { loginAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        autoComplete="current-password"
      />
      {state.error && (
        <p role="alert" className="text-sm text-error-600">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        Anmelden
      </Button>
    </form>
  );
}
