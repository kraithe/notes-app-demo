import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export class SignInResponseDto {
  accessToken!: string;
}

export const SignInSwagger = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Sign in with username and password' }),
    ApiOkResponse({ type: SignInResponseDto }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
