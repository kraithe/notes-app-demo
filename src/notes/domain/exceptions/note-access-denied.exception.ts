import { ForbiddenException } from '@nestjs/common';

export class NoteAccessDeniedException extends ForbiddenException {
  constructor() {
    super('You do not have permission to access this note.');
  }
}
