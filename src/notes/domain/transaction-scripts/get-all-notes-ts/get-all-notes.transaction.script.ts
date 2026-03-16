import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../infrastructure/repositories/note.repository';
import { NoteSummaryResponseDto } from '../../../application/dtos/responses/note-summary.response.dto';
import type { GetAllNotesParam } from './get-all-notes.param';
import type { Note } from '../../entities/note.entity';

@Injectable()
export class GetAllNotesTS {
  constructor(private readonly noteRepository: NoteRepository) {}

  async apply(param: GetAllNotesParam): Promise<NoteSummaryResponseDto[]> {
    const notes = await this.noteRepository.findAllByUserId(param.userId);
    return notes.map((note) => this.toSummary(note));
  }

  private toSummary(note: Note): NoteSummaryResponseDto {
    const dto = new NoteSummaryResponseDto();
    dto.id = note.id;
    dto.ownedByUserId = note.ownedByUserId;
    dto.titlePreview = NoteSummaryResponseDto.truncate(note.title);
    dto.contentPreview = NoteSummaryResponseDto.truncate(note.content);
    dto.lastModifiedDate = note.lastModifiedDate;
    return dto;
  }
}
