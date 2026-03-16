import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotesService } from './domain/services/notes.service';
import { NotesController } from './application/controllers/notes.controller';
import { repositoryRegistry } from './registries/repository.registry';
import { transactionScriptRegistry } from './registries/transaction-script.registry';

@Module({
  imports: [
    ...repositoryRegistry.imports,
    AuthModule,
  ],
  controllers: [NotesController],
  providers: [
    NotesService,
    ...repositoryRegistry.providers,
    ...transactionScriptRegistry.providers,
  ],
})
export class NotesModule {}
