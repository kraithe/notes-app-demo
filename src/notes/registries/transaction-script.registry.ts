import { GetAllNotesTS } from '../domain/transaction-scripts/get-all-notes-ts/get-all-notes.transaction.script';
import { GetNoteTS } from '../domain/transaction-scripts/get-note-ts/get-note.transaction.script';
import { CreateNoteTS } from '../domain/transaction-scripts/create-note-ts/create-note.transaction.script';
import { UpdateNoteTS } from '../domain/transaction-scripts/update-note-ts/update-note.transaction.script';
import { DeleteNoteTS } from '../domain/transaction-scripts/delete-note-ts/delete-note.transaction.script';

export const transactionScriptRegistry = {
  providers: [GetAllNotesTS, GetNoteTS, CreateNoteTS, UpdateNoteTS, DeleteNoteTS],
  exports: [GetAllNotesTS, GetNoteTS, CreateNoteTS, UpdateNoteTS, DeleteNoteTS],
};
