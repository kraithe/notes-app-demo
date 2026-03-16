import { SignInTS } from '../domain/transaction-scripts/sign-in-ts/sign-in.transaction.script';
import { SignOutTS } from '../domain/transaction-scripts/sign-out-ts/sign-out.transaction.script';

export const transactionScriptRegistry = {
  providers: [SignInTS, SignOutTS],
  exports: [SignInTS, SignOutTS],
};
