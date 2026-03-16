import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

export const UpdateNoteSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update an existing note' }),
    ApiOkResponse({ type: NoteResponseDto }),
    ApiNotFoundResponse({ description: 'Note not found' }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
  );
