import { UseCaseError } from './use-case-error.js';

export class UserNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`User "${identifier}" not found.`);
  }
}
