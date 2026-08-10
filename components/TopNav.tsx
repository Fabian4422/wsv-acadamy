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
    <header className="relative z-50 flex h-24 w-full items-center justify-start overflow-x-visible overflow-y-clip bg-white pl-2 pr-6">
      <div className="flex h-full shrink-0 items-center justify-start overflow-visible">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wsv-logo.png"
          alt="WSV Logo"
          className="block max-w-none"
          style={{
            height: "160px",
            width: "auto",
            display: "block",
            transform: "scale(2)",
            transformOrigin: "left center",
            marginRight: "14rem",
          }}
        />
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-4">
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
                className="rounded-md border border-green-600 px-4 py-2 font-medium text-green-600 transition-colors hover:bg-green-50"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
            >
              Ausloggen
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
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
