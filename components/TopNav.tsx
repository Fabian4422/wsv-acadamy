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
    <header className="relative z-50 flex w-full flex-wrap items-center justify-between gap-3 overflow-x-hidden bg-white px-3 py-3 sm:h-24 sm:flex-nowrap sm:gap-4 sm:overflow-y-clip sm:px-6 sm:py-0 sm:pl-2">
      <div className="flex min-w-0 shrink items-center overflow-hidden sm:h-full sm:shrink-0 sm:overflow-visible">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wsv-logo.png"
          alt="WSV Academy Logo"
          className="nav-logo block h-14 w-auto max-w-[min(100%,11rem)] object-contain object-left"
        />
      </div>

      <div className="relative z-10 flex max-w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:shrink-0 sm:gap-4">
        {!loading && user ? (
          <>
            <span className="hidden text-sm text-zinc-600 sm:inline">
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
                className="rounded-md border border-green-600 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 sm:px-4"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:px-4"
            >
              Ausloggen
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:px-4"
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
