import { Injectable, Logger } from '@nestjs/common';
import { RelatedNotesService } from '../sub-modules/related-notes/related-notes.service';
import { SuggestedWebContentService } from '../sub-modules/suggested-web-content/suggested-web-content.service';
import type { NoteId } from '../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../users/domain/entities/user.entity';

export type NoteComputeContext = {
  readonly noteId: NoteId;
  readonly userId: UserId;
  readonly title: string;
  readonly content: string;
};

@Injectable()
export class ComputeService {
  private readonly logger = new Logger(ComputeService.name);

  constructor(
    private readonly relatedNotesService: RelatedNotesService,
    private readonly suggestedWebContentService: SuggestedWebContentService,
  ) {}

  /**
   * Triggers after a note is created or updated.
   * Re-embeds and re-computes related notes for all of the user's notes,
   * and fetches fresh web content suggestions for the changed note.
   * Errors are logged and swallowed — this must never surface as an HTTP error.
   */
  async afterNoteUpsert(context: NoteComputeContext): Promise<void> {
    await Promise.allSettled([
      this.runRelatedNotes(context.noteId, context.userId),
      this.runWebContent(context),
    ]);
  }

  /**
   * Triggers after a note is deleted.
   * Removes the embedding and all associated records for the deleted note,
   * then re-computes related notes for all remaining notes.
   * Web content records are deleted but not re-generated (no note to generate for).
   */
  async afterNoteDeleted(noteId: NoteId, userId: UserId): Promise<void> {
    await Promise.allSettled([
      this.runRelatedNotesAfterDelete(noteId, userId),
      this.runWebContentDelete(noteId),
    ]);
  }

  private async runRelatedNotes(noteId: NoteId, userId: UserId): Promise<void> {
    try {
      await this.relatedNotesService.recomputeForUser(noteId, userId);
    } catch (err) {
      this.logger.error(
        `RelatedNotes recompute failed for note ${noteId}`,
        err,
      );
    }
  }

  private async runWebContent(context: NoteComputeContext): Promise<void> {
    try {
      await this.suggestedWebContentService.recomputeForNote(
        context.noteId,
        context.title,
        context.content,
      );
    } catch (err) {
      this.logger.error(
        `WebContent recompute failed for note ${context.noteId}`,
        err,
      );
    }
  }

  private async runRelatedNotesAfterDelete(
    noteId: NoteId,
    userId: UserId,
  ): Promise<void> {
    try {
      await this.relatedNotesService.removeEmbeddingForNote(noteId, userId);
    } catch (err) {
      this.logger.error(
        `RelatedNotes cleanup failed for deleted note ${noteId}`,
        err,
      );
    }
  }

  private async runWebContentDelete(noteId: NoteId): Promise<void> {
    try {
      await this.suggestedWebContentService.deleteForNote(noteId);
    } catch (err) {
      this.logger.error(
        `WebContent cleanup failed for deleted note ${noteId}`,
        err,
      );
    }
  }
}
