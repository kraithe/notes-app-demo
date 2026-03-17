"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { NoteNavItem } from "@/components/notes/note-nav-item";
import { EditNote } from "@/components/notes/edit-note";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import type { Note, NoteSummary } from "@/lib/types";

/** Sentinel value used to represent "new note" mode */
const NEW_NOTE_ID = -1 as const;

export default function NotesPage() {
  const router = useRouter();
  const auth = useAuth();

  // ── data state ──────────────────────────────────────────────────────────
  const [summaries, setSummaries] = useState<NoteSummary[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [selectedId, setSelectedId] = useState<number>(NEW_NOTE_ID);

  // ── ui state ─────────────────────────────────────────────────────────────
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── auth guard ───────────────────────────────────────────────────────────
  // Wait for the AuthProvider to hydrate from sessionStorage before deciding
  // whether to redirect. isLoadingNotes serves as the "not yet ready" flag
  // until the initial fetch resolves.
  useEffect(() => {
    if (!auth.token && !isLoadingNotes) {
      router.replace("/sign-in");
    }
  }, [auth.token, isLoadingNotes, router]);

  // ── initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.token) return;

    let cancelled = false;

    async function load() {
      setIsLoadingNotes(true);
      setLoadError(null);
      try {
        const data = await api.getAllNotes(auth.token!);
        if (cancelled) return;
        setSummaries(data.notes);
        if (data.mostRecentNote) {
          setActiveNote(data.mostRecentNote);
          setSelectedId(data.mostRecentNote.id);
        } else {
          setActiveNote(null);
          setSelectedId(NEW_NOTE_ID);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof api.ApiError && err.status === 401) {
          auth.signOut();
          router.replace("/sign-in");
          return;
        }
        setLoadError("Failed to load notes. Please refresh.");
      } finally {
        if (!cancelled) setIsLoadingNotes(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  // auth.token is stable once set; we only want this to run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  // ── select existing note ─────────────────────────────────────────────────
  const handleSelectNote = useCallback(
    async (id: number) => {
      if (id === selectedId || !auth.token) return;
      try {
        const note = await api.getNote(auth.token, id);
        setActiveNote(note);
        setSelectedId(id);
      } catch (err) {
        if (err instanceof api.ApiError && err.status === 401) {
          auth.signOut();
          router.replace("/sign-in");
        }
      }
    },
    [selectedId, auth, router]
  );

  // ── save (create or update) ──────────────────────────────────────────────
  const handleSave = useCallback(
    async (title: string, content: string) => {
      if (!auth.token) return;
      setIsSaving(true);
      try {
        let saved: Note;
        if (selectedId === NEW_NOTE_ID) {
          saved = await api.createNote(auth.token, title, content);
        } else {
          saved = await api.updateNote(auth.token, selectedId, title, content);
        }

        // Refresh the sidebar list and update active note
        const data = await api.getAllNotes(auth.token);
        setSummaries(data.notes);
        setActiveNote(saved);
        setSelectedId(saved.id);
      } catch (err) {
        if (err instanceof api.ApiError && err.status === 401) {
          auth.signOut();
          router.replace("/sign-in");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [selectedId, auth, router]
  );

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!auth.token || selectedId === NEW_NOTE_ID) return;
    setIsDeleting(true);
    try {
      await api.deleteNote(auth.token, selectedId);

      // Reload list; select most recent remaining note or fall back to new-note mode
      const data = await api.getAllNotes(auth.token);
      setSummaries(data.notes);
      if (data.mostRecentNote) {
        setActiveNote(data.mostRecentNote);
        setSelectedId(data.mostRecentNote.id);
      } else {
        setActiveNote(null);
        setSelectedId(NEW_NOTE_ID);
      }
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) {
        auth.signOut();
        router.replace("/sign-in");
      }
    } finally {
      setIsDeleting(false);
    }
  }, [selectedId, auth, router]);

  // ── sign out ─────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    if (!auth.token) return;
    setIsSigningOut(true);
    try {
      await api.signOut(auth.token);
    } catch {
      // Proceed with client-side sign-out even if the server call fails
    } finally {
      auth.signOut();
      router.replace("/sign-in");
    }
  }, [auth, router]);

  // ── render ────────────────────────────────────────────────────────────────
  // While the auth context is hydrating from sessionStorage, render nothing
  // to avoid a flash of the wrong state.
  if (!auth.token && isLoadingNotes) return null;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-base font-semibold text-white tracking-tight">
          Notes
        </h1>
        <div className="flex items-center gap-4">
          {auth.username && (
            <span
              className="text-sm text-zinc-400"
              aria-label={`Signed in as ${auth.username}`}
            >
              {auth.username}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            aria-label="Sign out"
          >
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </header>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left nav pane ── */}
        <nav
          aria-label="Notes list"
          className="w-72 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900"
        >
          {/* New note button */}
          <div className="px-3 pt-4 pb-2 flex-shrink-0">
            <Button
              type="button"
              size="sm"
              className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
              onClick={() => {
                setActiveNote(null);
                setSelectedId(NEW_NOTE_ID);
              }}
              aria-label="Create new note"
            >
              + New note
            </Button>
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {isLoadingNotes ? (
              <p className="px-2 pt-4 text-sm text-zinc-500" role="status">
                Loading…
              </p>
            ) : loadError ? (
              <p className="px-2 pt-4 text-sm text-red-400" role="alert">
                {loadError}
              </p>
            ) : summaries.length === 0 ? (
              <p className="px-2 pt-4 text-sm text-zinc-500">
                No notes to display.
              </p>
            ) : (
              <ul role="list" className="space-y-1 mt-1">
                {summaries.map((s) => (
                  <li key={s.id} role="listitem">
                    <NoteNavItem
                      note={s}
                      isSelected={s.id === selectedId}
                      onClick={() => handleSelectNote(s.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* ── Right note pane ── */}
        <main
          className="flex-1 min-w-0 flex flex-col p-8 overflow-y-auto"
          aria-label="Note editor"
        >
          {isLoadingNotes ? (
            <p className="text-sm text-zinc-500" role="status">
              Loading…
            </p>
          ) : (
            <EditNote
              note={activeNote}
              isSaving={isSaving}
              isDeleting={isDeleting}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
}
