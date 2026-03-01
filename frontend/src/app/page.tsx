"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CategoryButton } from "@/components/CategoryButton";
import { NoteCard } from "@/components/NoteCard";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  color_hex: string;
  notes_count?: number;
};

type Note = {
  id: number;
  title: string;
  content: string;
  category: { id: number; name: string; color_hex: string };
  updated_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [creatingNote, setCreatingNote] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = async () => {
    try {
      const [catsRes, notesRes] = await Promise.all([
        api.get<Category[]>("/api/categories/"),
        api.get<Note[]>("/api/notes/"),
      ]);
      setCategories(catsRes ?? []);
      setNotes(notesRes ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewNote = async () => {
    setCreatingNote(true);
    try {
      const created = await api.post<Note>("/api/notes/", {});
      if (created?.id != null) {
        router.push(`/notes/${created.id}`);
        return;
      }
      await fetchData();
    } finally {
      setCreatingNote(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/api/auth/logout/");
      router.replace("/login");
    } catch {
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const filteredNotes =
    selectedCategoryId === "all"
      ? notes
      : notes.filter((n) => n.category.id === selectedCategoryId);

  return (
    <AuthGuard>
      <div
        className="flex min-h-screen bg-[var(--background)]"
        data-loading={loading}
      >
        {/* Sidebar */}
        <aside className="flex w-80 shrink-0 flex-col  border-black/10 bg-[var(--background)] p-8">
          <h2 className="mb-8 text-xl font-bold text-black">
          </h2>
          <h2 className="mb-8 text-xl font-bold text-black">
          </h2>
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-normal text-black transition-colors`}
            >
              <h2 className="text-xl font-bold text-black">
                All Categories
              </h2>
            </button>
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                selected={selectedCategoryId === cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
              />
            ))}
          </nav>
          <div className="mt-auto pt-8">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-base font-medium text-black/70 underline hover:text-black disabled:opacity-50"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col p-8">
          <div className="mb-8 flex items-center justify-end">
            <button
              type="button"
              onClick={handleNewNote}
              disabled={creatingNote}
              className="flex items-center gap-2 rounded-xl border border-[#957139] bg-[#f5ede0] px-6 py-2.5 text-base font-medium text-[#957139] shadow-sm hover:bg-[#ede4d5] disabled:opacity-50"
            >
              <span>+</span>
              <span>New Note</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <div className="relative h-80 w-80">
                <Image
                  src="/icons/coffee.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xl text-[#88642A]">
                I&apos;m just here waiting for your charming notes…
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
