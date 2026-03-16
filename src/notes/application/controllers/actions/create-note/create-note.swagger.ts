import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

export const CreateNoteSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new note for the authenticated user' }),
    ApiCreatedResponse({ type: NoteResponseDto }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
  );
