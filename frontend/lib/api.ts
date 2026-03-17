import type {
  GetAllNotesResponse,
  Note,
  RelatedNote,
  SuggestedWebContent,
} from "./types";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (Array.isArray(body?.message) ? body.message[0] : body?.message) ??
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function signIn(
  username: string,
  password: string
): Promise<{ accessToken: string }> {
  const res = await fetch(`${BASE}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function signOut(token: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/sign-out`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getAllNotes(token: string): Promise<GetAllNotesResponse> {
  const res = await fetch(`${BASE}/notes`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getNote(token: string, id: number): Promise<Note> {
  const res = await fetch(`${BASE}/notes/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function createNote(
  token: string,
  title: string,
  content: string
): Promise<Note> {
  const res = await fetch(`${BASE}/notes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title, content }),
  });
  return handleResponse(res);
}

export async function updateNote(
  token: string,
  id: number,
  title: string,
  content: string
): Promise<Note> {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ title, content }),
  });
  return handleResponse(res);
}

export async function deleteNote(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getRelatedNotes(
  token: string,
  noteId: number
): Promise<RelatedNote[]> {
  const res = await fetch(`${BASE}/compute/notes/${noteId}/related-notes`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getSuggestedWebContent(
  token: string,
  noteId: number
): Promise<SuggestedWebContent[]> {
  const res = await fetch(`${BASE}/compute/notes/${noteId}/suggested-web-content`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
