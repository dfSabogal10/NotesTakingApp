"use client";

import Link from "next/link";
import { formatLastEdited } from "@/lib/date";

type NoteCardProps = {
  note: {
    id: number;
    title: string;
    content: string;
    category: { id: number; name: string; color_hex: string };
    updated_at: string;
  };
};

export function NoteCard({ note }: NoteCardProps) {
  const catColor = note.category?.color_hex || "#FBE7CD";
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block rounded-xl p-6 min-h-80 shadow transition-shadow hover:shadow-md"
      style={{ backgroundColor: catColor }}
    >
      <div className="mb-3 flex items-center justify-between text-sm text-black">
        <span>{formatLastEdited(note.updated_at)}</span>
        <span className="font-medium">{note.category?.name ?? ""}</span>
      </div>
      <h3 className="mb-3 text-xl font-bold leading-snug text-black line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
        {note.title || "Untitled"}
      </h3>
      <p className="text-sm leading-relaxed text-black line-clamp-3 whitespace-pre-wrap">
        {note.content || "No content"}
      </p>
    </Link>
  );
}
