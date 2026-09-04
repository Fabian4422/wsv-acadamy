"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export function TopNav() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  return (
    <header className="nav-header relative z-50 flex w-full flex-wrap items-center justify-between gap-3 bg-white px-3 py-3 md:h-24 md:flex-nowrap md:gap-4 md:overflow-y-clip md:px-6 md:py-0 md:pl-2">
      <div className="nav-logo-wrap flex shrink-0 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wsv-logo.png"
          alt="WSV Academy Logo"
          className="nav-logo"
        />
      </div>

      <div className="relative z-10 flex max-w-full flex-wrap items-center justify-end gap-2 md:ml-auto md:shrink-0 md:gap-4">
        {!loading && user ? (
          <>
            <span className="hidden text-sm text-zinc-600 md:inline">
              {user.username}
              {isAdmin && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                  Admin
                </span>
              )}
            </span>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md border border-green-600 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 md:px-4"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 md:px-4"
            >
              Ausloggen
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 md:px-4"
          >
            Login
          </Link>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-green-600"
        aria-hidden
      />
    </header>
  );
}
