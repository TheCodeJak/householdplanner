"use client";

import { Form, Formik } from "formik";
import { Button } from "jaklib/core";
import { TextField } from "jaklib/formik";
import { startTransition, useActionState } from "react";
import { loginAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

type LoginValues = { email: string; password: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <Formik<LoginValues>
      initialValues={{ email: state.email ?? "", password: "" }}
      onSubmit={(values) => {
        const formData = new FormData();
        formData.append("email", values.email);
        formData.append("password", values.password);
        startTransition(() => {
          formAction(formData);
        });
      }}
    >
      <Form className="flex flex-col gap-4">
        <TextField
          label="E-Mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <TextField
          label="Passwort"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state.error && (
          <p role="alert" className="text-secondary text-danger">
            {state.error}
          </p>
        )}
        <Button type="submit" className="mt-2 w-full" disabled={pending}>
          Anmelden
        </Button>
      </Form>
    </Formik>
  );
}
