import type { AuthError } from "@supabase/supabase-js";

export function isEmailNotConfirmed(error: AuthError | null): boolean {
  if (!error) return false;

  const message = error.message.toLowerCase();

  return (
    error.code === "email_not_confirmed" ||
    message.includes("email not confirmed") ||
    message.includes("email_not_confirmed") ||
    message.includes("not confirmed")
  );
}

export function isFailedToFetch(error: unknown): boolean {
  const message = formatErrorForDisplay(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed")
  );
}

export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof Error) {
    return error.message || JSON.stringify(error);
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return "Ein unbekannter Fehler ist aufgetreten.";

  if (isEmailNotConfirmed(error)) {
    return "Dieser Account ist noch nicht freigeschaltet. Bitte den Admin kontaktieren.";
  }

  if (
    error.code === "invalid_credentials" ||
    error.message.toLowerCase().includes("invalid login credentials")
  ) {
    return "Nutzername oder Passwort ist falsch.";
  }

  return error.message;
}

export function reportConnectionError(
  error: unknown,
  setError: (message: string) => void,
): void {
  console.error("Supabase Verbindungsfehler:", error);
  setError(formatErrorForDisplay(error));
}
