import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../exceptions/note-not-found.exception';
import type { DeleteNoteParam } from './delete-note.param';

@Injectable()
export class DeleteNoteTS {
  constructor(private readonly noteRepository: NoteRepository) {}

  async apply(param: DeleteNoteParam): Promise<void> {
    const note = await this.noteRepository.findOneByIdAndUserId(
      param.noteId,
      param.userId,
    );
    if (!note) {
      throw new NoteNotFoundException(param.noteId);
    }
    await this.noteRepository.deleteNote(note);
  }
}
