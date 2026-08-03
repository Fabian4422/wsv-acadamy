"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <TopNav />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <LoginForm onSuccess={() => router.replace("/")} />
      </main>
    </div>
  );
}
