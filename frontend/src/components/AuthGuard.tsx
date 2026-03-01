"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    (async () => {
      try {
        await api.get<unknown[]>("/api/categories/");
        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
        router.replace("/login");
      }
    })();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
