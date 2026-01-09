import { UseCaseError } from './use-case-error.js'

export class NotificationSendError extends Error implements UseCaseError {
  constructor() {
    super('Failed to send notification.')
  }
}
