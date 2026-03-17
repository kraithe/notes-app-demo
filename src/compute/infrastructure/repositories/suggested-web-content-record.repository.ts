import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuggestedWebContentRecord } from '../../domain/entities/suggested-web-content-record.entity';
import type { NoteId } from '../../../notes/domain/entities/note.entity';

@Injectable()
export class SuggestedWebContentRecordRepository {
  constructor(
    @InjectRepository(SuggestedWebContentRecord)
    private readonly repo: Repository<SuggestedWebContentRecord>,
  ) {}

  async deleteByPrimaryNoteId(primaryNoteId: NoteId): Promise<void> {
    await this.repo.delete({ primaryNoteId });
  }

  async replaceForNote(
    primaryNoteId: NoteId,
    suggestions: Array<{ webContentUrl: string; webContentTitle: string }>,
  ): Promise<void> {
    await this.deleteByPrimaryNoteId(primaryNoteId);
    if (suggestions.length === 0) {
      return;
    }
    const unique = this.deduplicateByUrl(suggestions);
    const records = unique.map((item) =>
      this.repo.create({
        primaryNoteId,
        webContentUrl: item.webContentUrl,
        webContentTitle: item.webContentTitle,
      }),
    );
    await this.repo.save(records);
  }

  private deduplicateByUrl(
    items: Array<{ webContentUrl: string; webContentTitle: string }>,
  ): Array<{ webContentUrl: string; webContentTitle: string }> {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.webContentUrl)) {
        return false;
      }
      seen.add(item.webContentUrl);
      return true;
    });
  }

  async findByPrimaryNoteId(
    primaryNoteId: NoteId,
  ): Promise<SuggestedWebContentRecord[]> {
    return this.repo.find({
      where: { primaryNoteId },
      order: { id: 'ASC' },
    });
  }
}
