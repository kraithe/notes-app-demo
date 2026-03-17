import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { NoteId } from '../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../users/domain/entities/user.entity';

/**
 * Stores the OpenAI text-embedding-3-small vector for each note.
 * The 'vector' column type requires the pgvector extension to be enabled.
 * Dimension 1536 matches text-embedding-3-small output.
 */
@Entity('note_embeddings')
export class NoteEmbedding {
  @PrimaryColumn({ name: 'note_id', type: 'integer' })
  noteId!: NoteId;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: UserId;

  @Column({ name: 'embedding', type: 'vector', length: 1536 })
  embedding!: number[];
}
