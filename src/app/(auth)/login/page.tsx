import { LoginForm } from "./form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Anmelden</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          Noch kein Konto?{" "}
          <a
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Registrieren
          </a>
        </p>
      </div>
    </div>
  );
}
