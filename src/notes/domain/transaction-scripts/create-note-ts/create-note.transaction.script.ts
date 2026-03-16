import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../infrastructure/repositories/note.repository';
import { NoteResponseDto } from '../../../application/dtos/responses/note.response.dto';
import type { CreateNoteParam } from './create-note.param';

@Injectable()
export class CreateNoteTS {
  constructor(private readonly noteRepository: NoteRepository) {}

  async apply(param: CreateNoteParam): Promise<NoteResponseDto> {
    const note = await this.noteRepository.createNote(
      param.userId,
      param.title,
      param.content,
    );
    const dto = new NoteResponseDto();
    dto.id = note.id;
    dto.ownedByUserId = note.ownedByUserId;
    dto.title = note.title;
    dto.content = note.content;
    dto.lastModifiedDate = note.lastModifiedDate;
    return dto;
  }
}
