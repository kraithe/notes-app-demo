import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { NoteId } from '../../../notes/domain/entities/note.entity';

export type RelatedNotesRecordId = number & { readonly __brand: 'RelatedNotesRecordId' };

@Entity('related_notes_records')
export class RelatedNotesRecord {
  @PrimaryGeneratedColumn()
  id!: RelatedNotesRecordId;

  @Column({ name: 'primary_note_id', type: 'integer' })
  primaryNoteId!: NoteId;

  @Column({ name: 'associated_note_id', type: 'integer' })
  associatedNoteId!: NoteId;

  @Column({ name: 'associated_note_title', type: 'varchar', length: 200 })
  associatedNoteTitle!: string;
}
