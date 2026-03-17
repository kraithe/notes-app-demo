import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/domain/entities/user.entity';
import { Note } from './notes/domain/entities/note.entity';
import { RelatedNotesRecord } from './compute/domain/entities/related-notes-record.entity';
import { SuggestedWebContentRecord } from './compute/domain/entities/suggested-web-content-record.entity';
import { NoteEmbedding } from './compute/domain/entities/note-embedding.entity';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { ComputeModule } from './compute/compute.module';

const THROTTLER_TTL_SECONDS = 60;
const THROTTLER_LIMIT = 30;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'notes_user'),
        password: configService.get<string>(
          'POSTGRES_PASSWORD',
          'notes_password',
        ),
        database: configService.get<string>('POSTGRES_DB', 'notes_db'),
        entities: [
          User,
          Note,
          RelatedNotesRecord,
          SuggestedWebContentRecord,
          NoteEmbedding,
        ],
        synchronize: true,
        installExtensions: true,
        extra: { max: 10 },
      }),
      dataSourceFactory: async (options) => {
        const { DataSource } = await import('typeorm');
        const dataSource = new DataSource(options!);
        await dataSource.initialize();
        await dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
        return dataSource;
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLER_TTL_SECONDS * 1000,
        limit: THROTTLER_LIMIT,
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    NotesModule,
    ComputeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
