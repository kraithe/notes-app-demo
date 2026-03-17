import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { NoteId } from '../../../notes/domain/entities/note.entity';

export type SuggestedWebContentRecordId = number & {
  readonly __brand: 'SuggestedWebContentRecordId';
};

@Entity('suggested_web_content_records')
export class SuggestedWebContentRecord {
  @PrimaryGeneratedColumn()
  id!: SuggestedWebContentRecordId;

  @Column({ name: 'primary_note_id', type: 'integer' })
  primaryNoteId!: NoteId;

  @Column({ name: 'web_content_url', type: 'varchar', length: 2048 })
  webContentUrl!: string;

  @Column({ name: 'web_content_title', type: 'varchar', length: 500 })
  webContentTitle!: string;

  @Column({
    name: 'web_content_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  webContentReason!: string | null;
}
