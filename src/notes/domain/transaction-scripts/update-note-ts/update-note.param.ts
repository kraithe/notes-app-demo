import type { NoteId } from '../../entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';

export type UpdateNoteParam = {
  readonly noteId: NoteId;
  readonly userId: UserId;
  readonly title: string;
  readonly content: string;
};
