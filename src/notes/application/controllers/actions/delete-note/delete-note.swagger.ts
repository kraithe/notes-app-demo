import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const DeleteNoteSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete a note by ID' }),
    ApiNoContentResponse({ description: 'Note deleted successfully' }),
    ApiNotFoundResponse({ description: 'Note not found' }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
  );
