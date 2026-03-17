import type { NoteId } from '../../notes/domain/entities/note.entity';
import type { UserId } from '../../users/domain/entities/user.entity';

export type ApiEvent = {
  readonly type: 'api';
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly userId?: UserId;
  readonly errorName?: string;
  readonly errorMessage?: string;
};

export type LlmEventKind = 'embedding' | 'web-content';

export type LlmEvent = {
  readonly type: 'llm';
  readonly kind: LlmEventKind;
  readonly model: string;
  readonly success: boolean;
  readonly durationMs: number;
  readonly noteId?: NoteId;
  readonly userId?: UserId;
  readonly errorName?: string;
  readonly errorMessage?: string;
};

export type DomainEvent = ApiEvent | LlmEvent;
