import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../../users/infrastructure/repositories/user.repository';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import type { JwtPayload } from '../jwt-payload.type';
import type { UserId } from '../../../users/domain/entities/user.entity';

export type AuthenticatedUser = {
  readonly userId: UserId;
  readonly username: string;
  readonly jti: string;
  readonly exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (this.tokenBlacklistService.isRevoked(payload.jti)) {
      throw new UnauthorizedException('Session has been revoked.');
    }
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
