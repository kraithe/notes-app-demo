import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { GetAllNotesTS } from '../transaction-scripts/get-all-notes-ts/get-all-notes.transaction.script';
import { GetNoteTS } from '../transaction-scripts/get-note-ts/get-note.transaction.script';
import { CreateNoteTS } from '../transaction-scripts/create-note-ts/create-note.transaction.script';
import { UpdateNoteTS } from '../transaction-scripts/update-note-ts/update-note.transaction.script';
import { DeleteNoteTS } from '../transaction-scripts/delete-note-ts/delete-note.transaction.script';
import { ComputeService } from '../../../compute/domain/services/compute.service';
import { GetAllNotesResponseDto } from '../../application/dtos/responses/get-all-notes.response.dto';
import { NoteResponseDto } from '../../application/dtos/responses/note.response.dto';
import type { UserId } from '../../../users/domain/entities/user.entity';
import type { NoteId } from '../entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    private readonly getAllNotesTS: GetAllNotesTS,
    private readonly getNoteTS: GetNoteTS,
    private readonly createNoteTS: CreateNoteTS,
    private readonly updateNoteTS: UpdateNoteTS,
    private readonly deleteNoteTS: DeleteNoteTS,
    @Inject(forwardRef(() => ComputeService))
    private readonly computeService: ComputeService,
  ) {}

  async getAllNotes(userId: UserId): Promise<GetAllNotesResponseDto> {
    const notes = await this.getAllNotesTS.apply({ userId });
    if (notes.length === 0) {
      return { notes: [], mostRecentNote: null };
    }
    const mostRecentNote = await this.getNoteTS.apply({
      noteId: notes[0].id as NoteId,
      userId,
    });
    return { notes, mostRecentNote };
  }

  async getNote(noteId: NoteId, userId: UserId): Promise<NoteResponseDto> {
    return this.getNoteTS.apply({ noteId, userId });
  }

  async createNote(
    userId: UserId,
    title: string,
    content: string,
  ): Promise<NoteResponseDto> {
    const note = await this.createNoteTS.apply({ userId, title, content });
    void this.computeService.afterNoteUpsert({
      noteId: note.id as NoteId,
      userId,
      title: note.title,
      content: note.content,
    });
    return note;
  }

  async updateNote(
    noteId: NoteId,
    userId: UserId,
    title: string,
    content: string,
  ): Promise<NoteResponseDto> {
    const note = await this.updateNoteTS.apply({ noteId, userId, title, content });
    void this.computeService.afterNoteUpsert({
      noteId: note.id as NoteId,
      userId,
      title: note.title,
      content: note.content,
    });
    return note;
  }

  async deleteNote(noteId: NoteId, userId: UserId): Promise<void> {
    await this.deleteNoteTS.apply({ noteId, userId });
    void this.computeService.afterNoteDeleted(noteId, userId);
  }
}
