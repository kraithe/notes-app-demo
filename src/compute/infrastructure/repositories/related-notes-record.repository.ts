import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelatedNotesRecord } from '../../domain/entities/related-notes-record.entity';
import type { NoteId } from '../../../notes/domain/entities/note.entity';

@Injectable()
export class RelatedNotesRecordRepository {
  constructor(
    @InjectRepository(RelatedNotesRecord)
    private readonly repo: Repository<RelatedNotesRecord>,
  ) {}

  async deleteByPrimaryNoteId(primaryNoteId: NoteId): Promise<void> {
    await this.repo.delete({ primaryNoteId });
  }

  async deleteByAssociatedNoteId(associatedNoteId: NoteId): Promise<void> {
    await this.repo.delete({ associatedNoteId });
  }

  async replaceForPrimaryNote(
    primaryNoteId: NoteId,
    related: Array<{ associatedNoteId: NoteId; associatedNoteTitle: string }>,
  ): Promise<void> {
    await this.deleteByPrimaryNoteId(primaryNoteId);
    if (related.length === 0) {
      return;
    }
    const records = related.map((item) =>
      this.repo.create({
        primaryNoteId,
        associatedNoteId: item.associatedNoteId,
        associatedNoteTitle: item.associatedNoteTitle,
      }),
    );
    await this.repo.save(records);
  }

  async findByPrimaryNoteId(
    primaryNoteId: NoteId,
  ): Promise<RelatedNotesRecord[]> {
    return this.repo.find({
      where: { primaryNoteId },
      order: { id: 'ASC' },
    });
  }
}
