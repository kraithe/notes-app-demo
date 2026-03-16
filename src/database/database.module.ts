import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/entities/user.entity';
import { Note } from '../notes/domain/entities/note.entity';
import { DatabaseSeederService } from './database-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Note])],
  providers: [DatabaseSeederService],
})
export class DatabaseModule {}
