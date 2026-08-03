import type { User } from "@supabase/supabase-js";

export const ADMIN_EMAIL = "fabian.4422k@gmail.com";

export type AppUser = {
  email: string;
  id: string;
};

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === "admin") return true;
  return isAdminEmail(user.email);
}
