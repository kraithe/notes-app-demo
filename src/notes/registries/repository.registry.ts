import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../domain/entities/note.entity';
import { NoteRepository } from '../infrastructure/repositories/note.repository';

export const repositoryRegistry = {
  imports: [TypeOrmModule.forFeature([Note])],
  providers: [NoteRepository],
  exports: [NoteRepository],
};
