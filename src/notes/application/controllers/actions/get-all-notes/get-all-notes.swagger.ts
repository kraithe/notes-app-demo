import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetAllNotesResponseDto } from '../../../dtos/responses/get-all-notes.response.dto';

export const GetAllNotesSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all notes for the authenticated user' }),
    ApiOkResponse({ type: GetAllNotesResponseDto }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
  );
