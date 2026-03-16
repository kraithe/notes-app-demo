import { ConflictException } from '@nestjs/common';

export class UsernameAlreadyExistsException extends ConflictException {
  constructor(username: string) {
    super(`Username '${username}' is already taken.`);
  }
}
