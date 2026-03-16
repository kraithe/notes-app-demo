import type { UserId } from '../../../../users/domain/entities/user.entity';

export type CreateNoteParam = {
  readonly userId: UserId;
  readonly title: string;
  readonly content: string;
};
