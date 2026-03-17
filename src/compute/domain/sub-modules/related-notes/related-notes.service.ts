import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { embed } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NoteEmbeddingRepository } from '../../../infrastructure/repositories/note-embedding.repository';
import { RelatedNotesRecordRepository } from '../../../infrastructure/repositories/related-notes-record.repository';
import { NoteRepository } from '../../../../notes/infrastructure/repositories/note.repository';
import type { NoteId } from '../../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';
import { DomainEventBus } from '../../../../common/events/domain-event-bus.service';

// UserId is used in method signatures but not in the buildNoteTitleMap helper

const EMBEDDING_MODEL = 'claude-3-haiku-20240307-embedding';

@Injectable()
export class RelatedNotesService {
  private readonly logger = new Logger(RelatedNotesService.name);
  private readonly embeddingCooldownMs = 60_000;
  private readonly lastEmbeddedAtByNoteId = new Map<number, number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly noteEmbeddingRepository: NoteEmbeddingRepository,
    private readonly relatedNotesRecordRepository: RelatedNotesRecordRepository,
    private readonly noteRepository: NoteRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async recomputeForUser(changedNoteId: NoteId, userId: UserId): Promise<void> {
    const allNotes = await this.noteRepository.findAllByUserId(userId);
    if (allNotes.length === 0) {
      return;
    }
    // Avoid spamming the embedding API: only embed the changed note. Existing
    // embeddings for the other notes remain valid for similarity search.
    const changed = allNotes.find((n) => n.id === changedNoteId);
    if (changed) {
      await this.upsertEmbeddingsForNotes(
        [{ id: changed.id, title: changed.title, content: changed.content }],
        userId,
      );
    }
    await this.recomputeRelatedRecordsForAllNotes(
      allNotes.map((n) => n.id),
      userId,
    );
  }

  async removeEmbeddingForNote(noteId: NoteId, userId: UserId): Promise<void> {
    await this.noteEmbeddingRepository.deleteByNoteId(noteId);
    await this.relatedNotesRecordRepository.deleteByPrimaryNoteId(noteId);
    await this.relatedNotesRecordRepository.deleteByAssociatedNoteId(noteId);
    const remainingNotes = await this.noteRepository.findAllByUserId(userId);
    await this.recomputeRelatedRecordsForAllNotes(
      remainingNotes.map((n) => n.id),
      userId,
    );
  }

  private async upsertEmbeddingsForNotes(
    notes: Array<{ id: NoteId; title: string; content: string }>,
    userId: UserId,
  ): Promise<void> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY is not set; skipping embeddings.');
      return;
    }

    await Promise.all(
      notes.map(async (note) => {
        const now = Date.now();
        const last = this.lastEmbeddedAtByNoteId.get(note.id as unknown as number);
        if (last && now - last < this.embeddingCooldownMs) {
          return;
        }

        const text = `${note.title}\n\n${note.content}`;
        const started = Date.now();
        try {
          const { embedding } = await embed({
            model: `${EMBEDDING_MODEL}`,
            value: text,
          });
          await this.noteEmbeddingRepository.upsertEmbedding(
            note.id,
            userId,
            embedding,
          );
          this.lastEmbeddedAtByNoteId.set(note.id as unknown as number, now);
          this.eventBus.emitLlm({
            kind: 'embedding',
            model: EMBEDDING_MODEL,
            success: true,
            durationMs: Date.now() - started,
            noteId: note.id,
            userId,
          });
        } catch (err) {
          this.logger.error(
            `Embedding generation failed for note ${note.id}`,
            err,
          );
          this.eventBus.emitLlm({
            kind: 'embedding',
            model: EMBEDDING_MODEL,
            success: false,
            durationMs: Date.now() - started,
            noteId: note.id,
            userId,
            errorName: err instanceof Error ? err.name : 'UnknownError',
            errorMessage: err instanceof Error ? err.message : String(err),
          });
          throw err;
        }
      }),
    );
  }

  private async recomputeRelatedRecordsForAllNotes(
    noteIds: NoteId[],
    userId: UserId,
  ): Promise<void> {
    await Promise.all(
      noteIds.map(async (noteId) => {
        const similar = await this.noteEmbeddingRepository.findSimilarNotes(
          noteId,
          userId,
        );
        const noteMap = await this.buildNoteTitleMap(
          similar.map((s) => s.noteId),
        );
        const related = similar.map((s) => ({
          associatedNoteId: s.noteId,
          associatedNoteTitle: noteMap.get(s.noteId) ?? '',
        }));
        await this.relatedNotesRecordRepository.replaceForPrimaryNote(
          noteId,
          related,
        );
      }),
    );
  }

  private async buildNoteTitleMap(
    noteIds: NoteId[],
  ): Promise<Map<NoteId, string>> {
    const titleMap = new Map<NoteId, string>();
    await Promise.all(
      noteIds.map(async (id) => {
        const note = await this.noteRepository.findById(id);
        if (note) {
          titleMap.set(id, note.title);
        }
      }),
    );
    return titleMap;
  }
}
