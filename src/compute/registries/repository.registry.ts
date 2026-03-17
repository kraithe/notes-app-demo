import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatedNotesRecord } from '../domain/entities/related-notes-record.entity';
import { SuggestedWebContentRecord } from '../domain/entities/suggested-web-content-record.entity';
import { NoteEmbedding } from '../domain/entities/note-embedding.entity';
import { RelatedNotesRecordRepository } from '../infrastructure/repositories/related-notes-record.repository';
import { SuggestedWebContentRecordRepository } from '../infrastructure/repositories/suggested-web-content-record.repository';
import { NoteEmbeddingRepository } from '../infrastructure/repositories/note-embedding.repository';

export const repositoryRegistry = {
  imports: [TypeOrmModule.forFeature([RelatedNotesRecord, SuggestedWebContentRecord, NoteEmbedding])],
  providers: [RelatedNotesRecordRepository, SuggestedWebContentRecordRepository, NoteEmbeddingRepository],
  exports: [RelatedNotesRecordRepository, SuggestedWebContentRecordRepository, NoteEmbeddingRepository],
};
