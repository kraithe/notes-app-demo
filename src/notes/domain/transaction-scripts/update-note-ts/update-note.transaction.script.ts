import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../exceptions/note-not-found.exception';
import { NoteResponseDto } from '../../../application/dtos/responses/note.response.dto';
import type { UpdateNoteParam } from './update-note.param';

@Injectable()
export class UpdateNoteTS {
  constructor(private readonly noteRepository: NoteRepository) {}

  async apply(param: UpdateNoteParam): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findOneByIdAndUserId(
      param.noteId,
      param.userId,
    );
    if (!note) {
      throw new NoteNotFoundException(param.noteId);
    }
    const updated = await this.noteRepository.updateNote(
      note,
      param.title,
      param.content,
    );
    const dto = new NoteResponseDto();
    dto.id = updated.id;
    dto.ownedByUserId = updated.ownedByUserId;
    dto.title = updated.title;
    dto.content = updated.content;
    dto.lastModifiedDate = updated.lastModifiedDate;
    return dto;
  }
}
