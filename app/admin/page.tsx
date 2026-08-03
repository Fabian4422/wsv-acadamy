"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminUserManager } from "@/components/AdminUserManager";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/lib/useAuth";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Admin-Bereich</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Trainer-Accounts verwalten und Zugangsdaten übergeben.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Zurück zum Portal
          </Link>
        </div>

        {loading || !user || !isAdmin ? (
          <p className="text-sm text-zinc-600">Zugriff wird geprüft…</p>
        ) : (
          <AdminUserManager />
        )}
      </main>
    </div>
  );
}
