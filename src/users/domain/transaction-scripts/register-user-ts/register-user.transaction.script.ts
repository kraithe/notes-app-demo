import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { UsernameAlreadyExistsException } from '../../exceptions/username-already-exists.exception';
import type { RegisterUserParam } from './register-user.param';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class RegisterUserTS {
  constructor(private readonly userRepository: UserRepository) {}

  async apply(param: RegisterUserParam): Promise<void> {
    await this.assertUsernameIsAvailable(param.username);
    const hashedPassword = await bcrypt.hash(
      param.password,
      BCRYPT_SALT_ROUNDS,
    );
    await this.userRepository.createUser(param.username, hashedPassword);
  }

  private async assertUsernameIsAvailable(username: string): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new UsernameAlreadyExistsException(username);
    }
  }
}
