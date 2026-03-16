import { RegisterUserTS } from '../domain/transaction-scripts/register-user-ts/register-user.transaction.script';

export const transactionScriptRegistry = {
  providers: [RegisterUserTS],
  exports: [RegisterUserTS],
};
