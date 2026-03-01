"use client";

import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { useAuthPage } from "@/hooks/useAuthPage";

export default function SignupPage() {
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
  } = useAuthPage("signup");

  if (!authCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <AuthCard title="Yay, New Friend!" illustration="/icons/cat.png">
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
          emailInputId="signup-email"
          passwordInputId="signup-password"
          passwordAutoComplete="new-password"
          submitLabel="Sign Up"
          submittingLabel="Signing up…"
        />
        <p className="mt-8 text-center text-sm text-[#a08060]">
          <Link href="/login" className="font-medium underline hover:text-[#704214]">
            We&apos;re already friends!
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
