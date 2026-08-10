"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/useAuth";

type ListedUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

type CreatedCredentials = {
  username: string;
  password: string;
};

function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => chars[value % chars.length]).join("");
}

export function AdminUserManager() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [created, setCreated] = useState<CreatedCredentials | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const authHeaders = useCallback((): HeadersInit => {
    if (!accessToken) return {};
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }, [accessToken]);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        headers: authHeaders(),
      });
      const data = (await response.json()) as {
        users?: ListedUser[];
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(data.error ?? "Benutzer konnten nicht geladen werden.");
        return;
      }

      setUsers(data.users ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Netzwerkfehler.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeaders]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setSubmitting(true);
    setErrorMessage(null);
    setCreated(null);
    setCopyFeedback(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as {
        user?: { username: string };
        password?: string;
        error?: string;
      };

      if (!response.ok || !data.user || !data.password) {
        setErrorMessage(data.error ?? "Benutzer konnte nicht angelegt werden.");
        return;
      }

      setCreated({
        username: data.user.username,
        password: data.password,
      });
      setUsername("");
      setPassword("");
      await fetchUsers();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Netzwerkfehler.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: string, userUsername: string) {
    if (!accessToken) return;
    const confirmed = window.confirm(
      `Benutzer „${userUsername}“ wirklich löschen?`,
    );
    if (!confirmed) return;

    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(data.error ?? "Löschen fehlgeschlagen.");
        return;
      }
      await fetchUsers();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Netzwerkfehler.",
      );
    }
  }

  async function copyCredentials() {
    if (!created) return;
    const text = `Nutzername: ${created.username}\nPasswort: ${created.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Zugangsdaten kopiert.");
    } catch {
      setCopyFeedback("Kopieren fehlgeschlagen – bitte manuell übernehmen.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-green-200 bg-white p-6 shadow-md">
        <h2 className="text-lg font-bold text-zinc-900">Trainer anlegen</h2>
        <p className="mt-1 mb-5 text-sm text-zinc-600">
          Lege einen Account an und übergib Nutzername sowie Passwort persönlich.
          Das Passwort wird nur einmal angezeigt.
        </p>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Nutzername
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={32}
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Passwort
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="shrink-0 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Zufallspasswort
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Anlegen…" : "Account anlegen"}
            </button>
          </div>
        </form>

        {created && (
          <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-900">
              Account erstellt – Zugangsdaten jetzt übergeben:
            </p>
            <dl className="mt-3 space-y-1 text-sm text-green-900">
              <div>
                <dt className="inline font-medium">Nutzername: </dt>
                <dd className="inline">{created.username}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Passwort: </dt>
                <dd className="inline font-mono">{created.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={copyCredentials}
              className="mt-3 rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Kopieren
            </button>
            {copyFeedback && (
              <p className="mt-2 text-sm text-green-800">{copyFeedback}</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-zinc-900">Benutzer</h2>
          <button
            type="button"
            onClick={fetchUsers}
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Aktualisieren
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-600">Lädt…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-zinc-600">Noch keine Benutzer vorhanden.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {user.username}
                    {user.role === "admin" && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        Admin
                      </span>
                    )}
                  </p>
                </div>
                {user.role !== "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.username)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Löschen
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
