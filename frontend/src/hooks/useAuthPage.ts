"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatError } from "@/lib/error";

type Mode = "login" | "signup";

export function useAuthPage(mode: Mode) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authCheckDone, setAuthCheckDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await api.get<unknown[]>("/api/categories/");
        router.replace("/");
      } catch {
        setAuthCheckDone(true);
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Email is required.");
      return;
    }
    if (mode === "login") {
      if (!password) {
        setError("Password is required.");
        return;
      }
    } else {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await api.post("/api/auth/login/", { email: emailTrimmed, password });
      } else {
        await api.post("/api/auth/signup/", { email: emailTrimmed, password });
        await api.post("/api/auth/login/", { email: emailTrimmed, password });
      }
      router.push("/");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}
