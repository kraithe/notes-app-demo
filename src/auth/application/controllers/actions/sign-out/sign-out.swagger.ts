import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const SignOutSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Sign out the currently authenticated user' }),
    ApiNoContentResponse({ description: 'Signed out successfully' }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
  );
