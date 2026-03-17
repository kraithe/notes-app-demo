import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RelatedNotesRecordRepository } from '../../../infrastructure/repositories/related-notes-record.repository';
import { NoteRepository } from '../../../../notes/infrastructure/repositories/note.repository';
import type { NoteId } from '../../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';
import { DomainEventBus } from '../../../../common/events/domain-event-bus.service';

// UserId is used in method signatures but not in the buildNoteTitleMap helper

const MAX_RELATED = 5;

@Injectable()
export class RelatedNotesService {
  private readonly logger = new Logger(RelatedNotesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly relatedNotesRecordRepository: RelatedNotesRecordRepository,
    private readonly noteRepository: NoteRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async recomputeForUser(changedNoteId: NoteId, userId: UserId): Promise<void> {
    const allNotes = await this.noteRepository.findAllByUserId(userId);
    if (allNotes.length === 0) {
      return;
    }
    // Anthropic does not provide embeddings. To keep related notes working
    // without relying on OpenAI/Voyage embeddings, compute lightweight local
    // similarity and persist related records.
    await this.recomputeRelatedRecordsForAllNotes(allNotes, userId);
  }

  async removeEmbeddingForNote(noteId: NoteId, userId: UserId): Promise<void> {
    await this.relatedNotesRecordRepository.deleteByPrimaryNoteId(noteId);
    await this.relatedNotesRecordRepository.deleteByAssociatedNoteId(noteId);
    const remainingNotes = await this.noteRepository.findAllByUserId(userId);
    await this.recomputeRelatedRecordsForAllNotes(remainingNotes, userId);
  }

  private async recomputeRelatedRecordsForAllNotes(
    notes: Array<{ id: NoteId; title: string; content: string }>,
    userId: UserId,
  ): Promise<void> {
    const started = Date.now();
    const docs = notes.map((n) => ({
      id: n.id,
      tokens: tokenize(`${n.title}\n${n.content}`),
      title: n.title,
    }));
    await Promise.all(
      docs.map(async (doc) => {
        const ranked = docs
          .filter((d) => d.id !== doc.id)
          .map((d) => ({
            id: d.id,
            title: d.title,
            score: jaccard(doc.tokens, d.tokens),
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_RELATED);

        const related = ranked.map((r) => ({
          associatedNoteId: r.id,
          associatedNoteTitle: r.title,
        }));
        await this.relatedNotesRecordRepository.replaceForPrimaryNote(
          doc.id,
          related,
        );
      }),
    );
    this.eventBus.emitLlm({
      // Re-use event channel for observability; this compute is local.
      kind: 'embedding',
      model: 'local-jaccard',
      success: true,
      durationMs: Date.now() - started,
      userId,
    });
  }
}

function tokenize(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/g)) {
    const t = raw.trim();
    if (t.length < 3) continue;
    tokens.add(t);
  }
  return tokens;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
