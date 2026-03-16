import { Injectable } from '@nestjs/common';
import { RegisterUserTS } from '../../../users/domain/transaction-scripts/register-user-ts/register-user.transaction.script';
import { SignInTS, SignInResult } from '../transaction-scripts/sign-in-ts/sign-in.transaction.script';
import { SignOutTS } from '../transaction-scripts/sign-out-ts/sign-out.transaction.script';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUserTS: RegisterUserTS,
    private readonly signInTS: SignInTS,
    private readonly signOutTS: SignOutTS,
  ) {}

  async register(username: string, password: string): Promise<void> {
    await this.registerUserTS.apply({ username, password });
  }

  async signIn(username: string, password: string): Promise<SignInResult> {
    return this.signInTS.apply({ username, password });
  }

  signOut(jti: string, exp: number): void {
    this.signOutTS.apply({ jti, exp });
  }
}
