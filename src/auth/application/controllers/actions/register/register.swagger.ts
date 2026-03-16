import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const RegisterSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user account' }),
    ApiCreatedResponse({ description: 'User registered successfully' }),
    ApiConflictResponse({ description: 'Username already taken' }),
  );
