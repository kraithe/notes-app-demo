import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserRepository } from '../../../../users/infrastructure/repositories/user.repository';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentials.exception';
import type { SignInParam } from './sign-in.param';

export type SignInResult = {
  readonly accessToken: string;
};

@Injectable()
export class SignInTS {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async apply(param: SignInParam): Promise<SignInResult> {
    const user = await this.userRepository.findByUsername(param.username);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    const passwordMatches = await bcrypt.compare(param.password, user.password);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }
    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.name,
      jti: randomUUID(),
    });
    return { accessToken };
  }
}
