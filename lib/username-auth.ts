import type { User } from "@supabase/supabase-js";

const AUTH_EMAIL_DOMAIN = "users.wsv-academy.internal";
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);
  if (!normalized) return "Nutzername ist erforderlich.";
  if (normalized.length < 3) return "Nutzername muss mindestens 3 Zeichen haben.";
  if (normalized.length > 32) return "Nutzername darf höchstens 32 Zeichen haben.";
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Nutzername darf nur Kleinbuchstaben, Ziffern, Punkte, Unterstriche und Bindestriche enthalten.";
  }
  return null;
}

export function usernameToAuthEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`;
}

export function getUsernameFromUser(user: User | null | undefined): string | null {
  if (!user) return null;

  if (typeof user.user_metadata?.username === "string") {
    const username = user.user_metadata.username.trim();
    if (username.length > 0) return username;
  }

  const email = user.email ?? "";
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  if (email.endsWith(suffix)) {
    const username = email.slice(0, -suffix.length);
    if (username.length > 0) return username;
  }

  return null;
}

export function isDuplicateUsernameError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("duplicate") ||
    lower.includes("unique")
  );
}
