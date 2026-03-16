import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { UserId } from '../../../users/domain/entities/user.entity';

export type NoteId = number & { readonly __brand: 'NoteId' };

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id!: NoteId;

  @Column({ name: 'owned_by_user_id', type: 'integer' })
  ownedByUserId!: UserId;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @UpdateDateColumn({ name: 'last_modified_date' })
  lastModifiedDate!: Date;

  @Column({ type: 'varchar', length: 200000 })
  content!: string;
}
