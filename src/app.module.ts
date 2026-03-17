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
import { EventsModule } from './common/events/events.module';
import { ApiLoggingInterceptor } from './common/interceptors/api-logging.interceptor';

const THROTTLER_TTL_SECONDS = 60;
const THROTTLER_LIMIT = 30;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // Prefer POSTGRES_* for local dev, but fall back to Railway's PG* vars
        host:
          configService.get<string>('POSTGRES_HOST') ??
          configService.get<string>('PGHOST', 'localhost'),
        port:
          configService.get<number>('POSTGRES_PORT') ??
          configService.get<number>('PGPORT', 5432),
        username:
          configService.get<string>('POSTGRES_USER') ??
          configService.get<string>('PGUSER', 'notes_user'),
        password:
          configService.get<string>('POSTGRES_PASSWORD') ??
          configService.get<string>('PGPASSWORD', 'notes_password'),
        database:
          configService.get<string>('POSTGRES_DB') ??
          configService.get<string>('PGDATABASE', 'notes_db'),
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
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ApiLoggingInterceptor],
})
export class AppModule {}
