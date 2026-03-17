import { Injectable, Logger } from '@nestjs/common';
import type { ApiEvent, LlmEvent, DomainEvent } from './domain-events';

/**
 * Thin domain event bus.
 *
 * For now this only logs structured events. In the future we can
 * attach listeners, forward to an external analytics service, etc.
 */
@Injectable()
export class DomainEventBus {
  private readonly logger = new Logger(DomainEventBus.name);

  emitApi(event: Omit<ApiEvent, 'type'>): void {
    this.log({ ...event, type: 'api' });
  }

  emitLlm(event: Omit<LlmEvent, 'type'>): void {
    this.log({ ...event, type: 'llm' });
  }

  private log(event: DomainEvent): void {
    // Single-line structured JSON for easy parsing
    this.logger.log(JSON.stringify(event));
  }
}
