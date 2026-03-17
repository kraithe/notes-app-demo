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

export type GetAllNotesResponse = {
  notes: NoteSummary[];
  mostRecentNote: Note | null;
};
