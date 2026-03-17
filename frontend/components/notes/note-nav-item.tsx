import { cn } from "@/lib/utils";
import type { NoteSummary } from "@/lib/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface NoteNavItemProps {
  note: NoteSummary;
  isSelected: boolean;
  onClick: () => void;
}

export function NoteNavItem({ note, isSelected, onClick }: NoteNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Note: ${note.titlePreview}`}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
        isSelected
          ? "bg-zinc-700 text-white"
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
      )}
    >
      <p className="text-sm font-semibold truncate leading-snug">
        {note.titlePreview}
      </p>
      <p className="text-xs text-zinc-400 truncate mt-0.5 leading-snug">
        {note.contentPreview}
      </p>
      <p className="text-xs text-zinc-500 mt-1">
        {formatDate(note.lastModifiedDate)}
      </p>
    </button>
  );
}
