import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../exceptions/note-not-found.exception';
import { NoteResponseDto } from '../../../application/dtos/responses/note.response.dto';
import type { GetNoteParam } from './get-note.param';

@Injectable()
export class GetNoteTS {
  constructor(private readonly noteRepository: NoteRepository) {}

  async apply(param: GetNoteParam): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findOneByIdAndUserId(
      param.noteId,
      param.userId,
    );
    if (!note) {
      throw new NoteNotFoundException(param.noteId);
    }
    const dto = new NoteResponseDto();
    dto.id = note.id;
    dto.ownedByUserId = note.ownedByUserId;
    dto.title = note.title;
    dto.content = note.content;
    dto.lastModifiedDate = note.lastModifiedDate;
    return dto;
  }
}
