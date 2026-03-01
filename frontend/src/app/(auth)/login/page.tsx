"use client";

import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { useAuthPage } from "@/hooks/useAuthPage";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    submitting,
    authCheckDone,
    handleSubmit,
  } = useAuthPage("login");

  if (!authCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <AuthCard title="Yay, You're Back!" illustration="/icons/cactus.png">
        <AuthForm
          email={email}
          password={password}
          showPassword={showPassword}
          error={error}
          submitting={submitting}
          onSubmit={handleSubmit}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onShowPasswordToggle={() => setShowPassword(!showPassword)}
          emailInputId="login-email"
          passwordInputId="login-password"
          passwordAutoComplete="current-password"
          submitLabel="Login"
          submittingLabel="Logging in…"
        />
        <p className="mt-8 text-center text-sm text-[#a08060]">
          <Link href="/signup" className="font-medium underline hover:text-[#704214]">
            Oops! I&apos;ve never been here before
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
