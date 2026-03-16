import { Injectable } from '@nestjs/common';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import type { SignOutParam } from './sign-out.param';

@Injectable()
export class SignOutTS {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  apply(param: SignOutParam): void {
    this.tokenBlacklistService.revokeToken(param.jti, param.exp);
  }
}
