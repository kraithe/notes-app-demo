import type { NoteId } from '../../entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';

export type DeleteNoteParam = {
  readonly noteId: NoteId;
  readonly userId: UserId;
};
