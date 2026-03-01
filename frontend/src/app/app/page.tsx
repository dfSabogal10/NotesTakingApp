"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
    </div>
  );
}
