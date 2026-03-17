import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEmbedding } from '../../domain/entities/note-embedding.entity';
import type { NoteId } from '../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../users/domain/entities/user.entity';

const MAX_RELATED_NOTES = 3;

export type SimilarNoteResult = {
  noteId: NoteId;
  similarity: number;
};

@Injectable()
export class NoteEmbeddingRepository {
  constructor(
    @InjectRepository(NoteEmbedding)
    private readonly repo: Repository<NoteEmbedding>,
  ) {}

  async upsertEmbedding(
    noteId: NoteId,
    userId: UserId,
    embedding: number[],
  ): Promise<void> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    await this.repo.query(
      `INSERT INTO note_embeddings (note_id, user_id, embedding)
       VALUES ($1, $2, $3::vector)
       ON CONFLICT (note_id) DO UPDATE SET embedding = EXCLUDED.embedding, user_id = EXCLUDED.user_id`,
      [noteId, userId, vectorLiteral],
    );
  }

  async deleteByNoteId(noteId: NoteId): Promise<void> {
    await this.repo.delete({ noteId });
  }

  /**
   * Returns up to MAX_RELATED_NOTES notes most similar to the given note,
   * excluding the note itself, ordered by cosine similarity descending.
   */
  async findSimilarNotes(
    noteId: NoteId,
    userId: UserId,
  ): Promise<SimilarNoteResult[]> {
    type RawRow = { note_id: number; similarity: number };
    const rows = await this.repo.query<RawRow[]>(
      `SELECT target.note_id,
              1 - (source.embedding <=> target.embedding) AS similarity
       FROM note_embeddings source
       JOIN note_embeddings target
         ON source.user_id = target.user_id
        AND target.note_id <> source.note_id
       WHERE source.note_id = $1
         AND source.user_id = $2
       ORDER BY similarity DESC
       LIMIT $3`,
      [noteId, userId, MAX_RELATED_NOTES],
    );
    return rows.map((row) => ({
      noteId: row.note_id as NoteId,
      similarity: row.similarity,
    }));
  }

  async findAllNoteIdsByUserId(userId: UserId): Promise<NoteId[]> {
    const rows = await this.repo.find({
      where: { userId },
      select: ['noteId'],
    });
    return rows.map((r) => r.noteId);
  }
}
