"use client";

import { useState, type FormEvent } from "react";
import {
  getAuthErrorMessage,
  reportConnectionError,
} from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";
import {
  normalizeUsername,
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/username-auth";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const validationError = validateUsername(username);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToAuthEmail(normalizeUsername(username)),
        password,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        console.error("Supabase Verbindungsfehler:", error);
        return;
      }

      onSuccess?.();
    } catch (error) {
      reportConnectionError(error, setErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-md sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Anmelden</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Melde dich mit Nutzername und Passwort an, die du vom Admin erhalten hast.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-zinc-800"
          >
            Nutzername
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-800"
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm break-words text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Bitte warten…" : "Einloggen"}
        </button>
      </form>
    </div>
  );
}
