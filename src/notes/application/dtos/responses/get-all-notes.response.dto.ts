import { ApiProperty } from '@nestjs/swagger';
import { NoteSummaryResponseDto } from './note-summary.response.dto';
import { NoteResponseDto } from './note.response.dto';

export class GetAllNotesResponseDto {
  @ApiProperty({ type: [NoteSummaryResponseDto] })
  notes!: NoteSummaryResponseDto[];

  @ApiProperty({ type: NoteResponseDto, nullable: true })
  mostRecentNote!: NoteResponseDto | null;
}
