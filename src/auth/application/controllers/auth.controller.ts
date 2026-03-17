import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../../domain/services/auth.service';
import { JwtAuthGuard } from '../../domain/guards/jwt-auth.guard';
import { RegisterUserDto } from '../../../users/application/dtos/requests/register-user.dto';
import { SignInDto } from '../dtos/requests/sign-in.dto';
import { RegisterSwagger } from './actions/register/register.swagger';
import {
  SignInSwagger,
  SignInResponseDto,
} from './actions/sign-in/sign-in.swagger';
import { SignOutSwagger } from './actions/sign-out/sign-out.swagger';
import type { AuthenticatedUser } from '../../domain/strategies/jwt.strategy';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@ApiTags('auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterSwagger()
  async register(@Body() dto: RegisterUserDto): Promise<void> {
    await this.authService.register(dto.username, dto.password);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @SignInSwagger()
  async signIn(@Body() dto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(dto.username, dto.password);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @SignOutSwagger()
  signOut(@Req() req: AuthenticatedRequest): void {
    this.authService.signOut(req.user.jti, req.user.exp);
  }
}
