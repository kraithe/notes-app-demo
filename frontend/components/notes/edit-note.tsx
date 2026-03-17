"use client";

import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

const TITLE_MAX = 200;
const CONTENT_MAX = 200000;
const NEW_NOTE_TITLE = "New Note";

interface EditNoteProps {
  /** Null means "create new note" mode */
  note: Note | null;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: (title: string, content: string) => void;
  onDelete: () => void;
}

export function EditNote({
  note,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: EditNoteProps) {
  const baseId = useId();
  const isNew = note === null;

  const [title, setTitle] = useState(isNew ? NEW_NOTE_TITLE : note.title);
  const [content, setContent] = useState(isNew ? "" : note.content);

  // Sync fields when the selected note changes
  useEffect(() => {
    setTitle(isNew ? NEW_NOTE_TITLE : note.title);
    setContent(isNew ? "" : note.content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  const canSave =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    title.length <= TITLE_MAX &&
    content.length <= CONTENT_MAX &&
    !isSaving &&
    !isDeleting;

  return (
    <article
      aria-label={isNew ? "New note" : `Editing: ${note.title}`}
      className="flex flex-col h-full"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 mb-4 flex-shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={() => onSave(title.trim(), content.trim())}
          disabled={!canSave}
          aria-disabled={!canSave}
          className="min-w-[64px]"
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>

        {!isNew && (
          <Button
            type="button"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
            aria-disabled={isDeleting || isSaving}
            className="min-w-[64px] bg-zinc-800 text-zinc-300 hover:bg-red-900 hover:text-white active:bg-red-800 border border-zinc-700 hover:border-red-800"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="mb-3 flex-shrink-0">
        <label htmlFor={`${baseId}-title`} className="sr-only">
          Note title
        </label>
        <input
          id={`${baseId}-title`}
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          aria-required="true"
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "w-full bg-transparent text-xl font-bold text-white placeholder:text-zinc-600",
            "border-b border-zinc-700 pb-2 focus:outline-none focus:border-zinc-400 transition-colors"
          )}
          placeholder="Note title"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <label htmlFor={`${baseId}-content`} className="sr-only">
          Note content
        </label>
        <textarea
          id={`${baseId}-content`}
          value={content}
          maxLength={CONTENT_MAX}
          aria-required="true"
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "w-full h-full resize-none bg-transparent text-sm text-zinc-200 leading-relaxed",
            "focus:outline-none placeholder:text-zinc-600"
          )}
          placeholder="Start writing…"
        />
      </div>
    </article>
  );
}
