"use client";

import { formatLastEdited } from "@/lib/date";

type EditNoteCardProps = {
  title: string;
  content: string;
  updatedAt: string | null;
  noteUpdatedAt: string;
  backgroundColor: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function EditNoteCard({
  title,
  content,
  updatedAt,
  noteUpdatedAt,
  backgroundColor,
  onTitleChange,
  onContentChange,
}: EditNoteCardProps) {
  return (
    <div
      className="rounded-2xl border border-black/10 p-8 shadow-md"
      style={{ backgroundColor }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-medium text-black/70">
          Last Edited: {formatLastEdited(updatedAt ?? noteUpdatedAt)}
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={onTitleChange}
        placeholder="Note Title"
        className="mb-6 w-full bg-transparent text-3xl font-bold text-black placeholder:text-black/40 focus:outline-none"
      />

      <textarea
        value={content}
        onChange={onContentChange}
        placeholder="Pour your heart out..."
        rows={14}
        className="w-full resize-none bg-transparent text-base leading-relaxed text-black placeholder:text-black/40 focus:outline-none"
      />
    </div>
  );
}
