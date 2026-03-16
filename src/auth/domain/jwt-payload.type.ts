import type { UserId } from '../../users/domain/entities/user.entity';

export type JwtPayload = {
  readonly sub: UserId;
  readonly username: string;
  readonly jti: string;
  readonly exp: number;
};
