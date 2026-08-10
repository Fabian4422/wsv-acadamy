import type { User } from "@supabase/supabase-js";

export type AppUser = {
  username: string;
  id: string;
};

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "admin";
}
