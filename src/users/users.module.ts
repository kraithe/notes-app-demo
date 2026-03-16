import { Module } from '@nestjs/common';
import { repositoryRegistry } from './registries/repository.registry';
import { transactionScriptRegistry } from './registries/transaction-script.registry';

@Module({
  imports: [...repositoryRegistry.imports],
  providers: [
    ...repositoryRegistry.providers,
    ...transactionScriptRegistry.providers,
  ],
  exports: [
    ...repositoryRegistry.exports,
    ...transactionScriptRegistry.exports,
  ],
})
export class UsersModule {}
