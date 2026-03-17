import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/domain/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../../auth/domain/strategies/jwt.strategy';
import { NoteRepository } from '../../../notes/infrastructure/repositories/note.repository';
import { RelatedNotesRecordRepository } from '../../infrastructure/repositories/related-notes-record.repository';
import { SuggestedWebContentRecordRepository } from '../../infrastructure/repositories/suggested-web-content-record.repository';
import { RelatedNoteResponseDto } from '../dtos/responses/related-note.response.dto';
import { SuggestedWebContentResponseDto } from '../dtos/responses/suggested-web-content.response.dto';
import type { NoteId } from '../../../notes/domain/entities/note.entity';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@ApiTags('compute')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@Controller('compute')
export class ComputeController {
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly relatedNotesRecordRepository: RelatedNotesRecordRepository,
    private readonly suggestedWebContentRecordRepository: SuggestedWebContentRecordRepository,
  ) {}

  @Get('notes/:id/related-notes')
  async getRelatedNotes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<RelatedNoteResponseDto[]> {
    // Authorization: ensure note belongs to current user
    const note = await this.noteRepository.findOneByIdAndUserId(
      id as NoteId,
      req.user.userId,
    );
    if (!note) return [];

    const records = await this.relatedNotesRecordRepository.findByPrimaryNoteId(
      id as NoteId,
    );
    return records.map((r) => {
      const dto = new RelatedNoteResponseDto();
      dto.id = r.associatedNoteId as unknown as number;
      dto.title = r.associatedNoteTitle;
      return dto;
    });
  }

  @Get('notes/:id/suggested-web-content')
  async getSuggestedWebContent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<SuggestedWebContentResponseDto[]> {
    const note = await this.noteRepository.findOneByIdAndUserId(
      id as NoteId,
      req.user.userId,
    );
    if (!note) return [];

    const records =
      await this.suggestedWebContentRecordRepository.findByPrimaryNoteId(
        id as NoteId,
      );
    return records.map((r) => {
      const dto = new SuggestedWebContentResponseDto();
      dto.url = r.webContentUrl;
      dto.title = r.webContentTitle;
      return dto;
    });
  }
}
