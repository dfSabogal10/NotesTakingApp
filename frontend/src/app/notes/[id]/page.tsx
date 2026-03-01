"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CategorySelect } from "@/components/CategorySelect";
import { EditNoteCard } from "@/components/EditNoteCard";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  color_hex: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  category: { id: number; name: string; color_hex: string };
  updated_at: string;
};

const DEBOUNCE_MS = 500;

export default function NoteEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const noteId = id ? parseInt(id, 10) : NaN;

  const [note, setNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ title?: string; content?: string; category_id?: number }>({});

  const patchPending = useCallback(async () => {
    const pending = pendingRef.current;
    const payload: Record<string, unknown> = {};
    if (pending.title !== undefined) payload.title = pending.title;
    if (pending.content !== undefined) payload.content = pending.content;
    if (pending.category_id !== undefined) payload.category_id = pending.category_id;
    pendingRef.current = {};

    if (Object.keys(payload).length === 0) return;

    try {
      const res = await api.patch<Note>(`/api/notes/${noteId}/`, payload);
      if (res?.updated_at) setUpdatedAt(res.updated_at);
    } catch {
      // Restore pending on error; optional: show toast
    }
  }, [noteId]);

  const schedulePatch = useCallback(
    (updates: { title?: string; content?: string; category_id?: number }) => {
      Object.assign(pendingRef.current, updates);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        patchPending();
      }, DEBOUNCE_MS);
    },
    [patchPending]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (Number.isNaN(noteId)) {
      setError("Invalid note");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [noteRes, catsRes] = await Promise.all([
          api.get<Note>(`/api/notes/${noteId}/`),
          api.get<Category[]>("/api/categories/"),
        ]);
        setNote(noteRes);
        setCategories(catsRes ?? []);
        setTitle(noteRes?.title ?? "");
        setContent(noteRes?.content ?? "");
        setCategoryId(noteRes?.category?.id ?? null);
        setUpdatedAt(noteRes?.updated_at ?? null);
      } catch {
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    })();
  }, [noteId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitle(v);
    schedulePatch({ title: v });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContent(v);
    schedulePatch({ content: v });
  };

  const handleCategoryChange = (catId: number) => {
    setCategoryId(catId);
    schedulePatch({ category_id: catId });
  };

  const bgColor = categories.find((c) => c.id === categoryId)?.color_hex || note?.category?.color_hex || "#FBE7CD";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--cream)] p-6">
        <div className="mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4">
            <CategorySelect
              categories={categories}
              value={categoryId ?? categories[0]?.id ?? 0}
              onChange={handleCategoryChange}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            />
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-xl font-medium text-black hover:border-black/40"
              aria-label="Close"
            >
              ×
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--sepia-light)]/30" />
            </div>
          ) : error || !note ? (
            <div className="rounded-xl border border-red-200/80 bg-red-50/80 p-6 text-center text-red-700">
              {error ?? "Note not found"}
              <Link href="/" className="mt-4 block text-sm underline">
                Back to dashboard
              </Link>
            </div>
          ) : (
            <EditNoteCard
              title={title}
              content={content}
              updatedAt={updatedAt}
              noteUpdatedAt={note.updated_at}
              backgroundColor={bgColor}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
