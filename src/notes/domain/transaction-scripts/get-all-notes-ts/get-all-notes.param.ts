import type { UserId } from '../../../../users/domain/entities/user.entity';

export type GetAllNotesParam = {
  readonly userId: UserId;
};
