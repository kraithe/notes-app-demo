export type NoteSummary = {
  id: number;
  ownedByUserId: number;
  titlePreview: string;
  contentPreview: string;
  lastModifiedDate: string;
};

export type Note = {
  id: number;
  ownedByUserId: number;
  title: string;
  content: string;
  lastModifiedDate: string;
};

export type RelatedNote = {
  id: number;
  title: string;
};

export type SuggestedWebContent = {
  url: string;
  title: string;
  reason: string | null;
};

export type GetAllNotesResponse = {
  notes: NoteSummary[];
  mostRecentNote: Note | null;
};
