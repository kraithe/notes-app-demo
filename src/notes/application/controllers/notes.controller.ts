import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import sanitizeHtml = require('sanitize-html');
import { JwtAuthGuard } from '../../../auth/domain/guards/jwt-auth.guard';
import { NotesService } from '../../domain/services/notes.service';
import { CreateNoteDto } from '../dtos/requests/create-note.dto';
import { UpdateNoteDto } from '../dtos/requests/update-note.dto';
import { GetAllNotesResponseDto } from '../dtos/responses/get-all-notes.response.dto';
import { NoteResponseDto } from '../dtos/responses/note.response.dto';
import { GetAllNotesSwagger } from './actions/get-all-notes/get-all-notes.swagger';
import { GetNoteSwagger } from './actions/get-note/get-note.swagger';
import { CreateNoteSwagger } from './actions/create-note/create-note.swagger';
import { UpdateNoteSwagger } from './actions/update-note/update-note.swagger';
import { DeleteNoteSwagger } from './actions/delete-note/delete-note.swagger';
import type { AuthenticatedUser } from '../../../auth/domain/strategies/jwt.strategy';
import type { NoteId } from '../../domain/entities/note.entity';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = { allowedTags: [], allowedAttributes: {} };

@ApiTags('notes')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @GetAllNotesSwagger()
  async getAllNotes(@Req() req: AuthenticatedRequest): Promise<GetAllNotesResponseDto> {
    return this.notesService.getAllNotes(req.user.userId);
  }

  @Get(':id')
  @GetNoteSwagger()
  async getNote(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<NoteResponseDto> {
    return this.notesService.getNote(id as NoteId, req.user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateNoteSwagger()
  async createNote(
    @Body() dto: CreateNoteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<NoteResponseDto> {
    const title = sanitizeHtml(dto.title, SANITIZE_OPTIONS);
    const content = sanitizeHtml(dto.content, SANITIZE_OPTIONS);
    return this.notesService.createNote(req.user.userId, title, content);
  }

  @Put(':id')
  @UpdateNoteSwagger()
  async updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<NoteResponseDto> {
    const title = sanitizeHtml(dto.title, SANITIZE_OPTIONS);
    const content = sanitizeHtml(dto.content, SANITIZE_OPTIONS);
    return this.notesService.updateNote(id as NoteId, req.user.userId, title, content);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteNoteSwagger()
  async deleteNote(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.notesService.deleteNote(id as NoteId, req.user.userId);
  }
}
