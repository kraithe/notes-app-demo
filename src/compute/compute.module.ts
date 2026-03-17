import { Module, forwardRef } from '@nestjs/common';
import { NotesModule } from '../notes/notes.module';
import { repositoryRegistry } from './registries/repository.registry';
import { ComputeService } from './domain/services/compute.service';
import { RelatedNotesService } from './domain/sub-modules/related-notes/related-notes.service';
import { SuggestedWebContentService } from './domain/sub-modules/suggested-web-content/suggested-web-content.service';

@Module({
  imports: [...repositoryRegistry.imports, forwardRef(() => NotesModule)],
  providers: [
    ...repositoryRegistry.providers,
    RelatedNotesService,
    SuggestedWebContentService,
    ComputeService,
  ],
  exports: [ComputeService],
})
export class ComputeModule {}
