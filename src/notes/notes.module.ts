import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ComputeModule } from '../compute/compute.module';
import { NotesService } from './domain/services/notes.service';
import { NotesController } from './application/controllers/notes.controller';
import { repositoryRegistry } from './registries/repository.registry';
import { transactionScriptRegistry } from './registries/transaction-script.registry';

@Module({
  imports: [
    ...repositoryRegistry.imports,
    AuthModule,
    forwardRef(() => ComputeModule),
  ],
  controllers: [NotesController],
  providers: [
    NotesService,
    ...repositoryRegistry.providers,
    ...transactionScriptRegistry.providers,
  ],
  exports: [
    ...repositoryRegistry.exports,
  ],
})
export class NotesModule {}
