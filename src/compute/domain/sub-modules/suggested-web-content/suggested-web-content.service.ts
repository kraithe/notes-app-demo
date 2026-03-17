import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { SuggestedWebContentRecordRepository } from '../../../infrastructure/repositories/suggested-web-content-record.repository';
import type { NoteId } from '../../../../notes/domain/entities/note.entity';
import { DomainEventBus } from '../../../../common/events/domain-event-bus.service';

const CHAT_MODEL = 'claude-haiku-4-5';
const MAX_SUGGESTIONS = 3;

const WebContentSuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      url: z.string().url(),
      title: z.string().min(1),
    }),
  ),
});

type WebContentSuggestion = z.infer<
  typeof WebContentSuggestionSchema
>['suggestions'][number];

@Injectable()
export class SuggestedWebContentService {
  private readonly logger = new Logger(SuggestedWebContentService.name);
  private readonly suggestionsCooldownMs = 60_000;
  private readonly lastSuggestedAtByNoteId = new Map<number, number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly suggestedWebContentRecordRepository: SuggestedWebContentRecordRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async recomputeForNote(
    noteId: NoteId,
    title: string,
    content: string,
  ): Promise<void> {
    const now = Date.now();
    const last = this.lastSuggestedAtByNoteId.get(noteId as unknown as number);
    if (last && now - last < this.suggestionsCooldownMs) {
      return;
    }

    const suggestions = await this.fetchWebContentSuggestions(title, content);
    await this.suggestedWebContentRecordRepository.replaceForNote(
      noteId,
      suggestions.map((s) => ({
        webContentUrl: s.url,
        webContentTitle: s.title,
      })),
    );
    this.lastSuggestedAtByNoteId.set(noteId as unknown as number, now);
  }

  async deleteForNote(noteId: NoteId): Promise<void> {
    await this.suggestedWebContentRecordRepository.deleteByPrimaryNoteId(
      noteId,
    );
  }

  private async fetchWebContentSuggestions(
    title: string,
    content: string,
  ): Promise<WebContentSuggestion[]> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY is not set; skipping web content suggestions.',
      );
      this.eventBus.emitLlm({
        kind: 'web-content',
        model: CHAT_MODEL,
        success: false,
        durationMs: 0,
        errorName: 'MissingAnthropicApiKey',
        errorMessage: 'ANTHROPIC_API_KEY is not set.',
      });
      return [];
    }

    const notePreview = content.slice(0, 500);
    const started = Date.now();
    try {
      const { object } = await generateObject({
        model: anthropic(CHAT_MODEL),
        schema: WebContentSuggestionSchema,
        prompt: `You are a research assistant. Based on the following note, suggest **at most ${MAX_SUGGESTIONS}** distinct web resources a reader might find useful. Include a mix of types such as articles, blog posts, YouTube videos, or documentation pages. Do not suggest websites or content that are clearly explicit, illegal or otherwise objectionable. Return only real, publicly accessible URLs with accurate titles.

Note title: ${title}

Note content (preview):
${notePreview}

Return an array of **no more than ${MAX_SUGGESTIONS}** objects, each with a "url" and "title" field.`,
      });
      this.eventBus.emitLlm({
        kind: 'web-content',
        model: CHAT_MODEL,
        success: true,
        durationMs: Date.now() - started,
      });
      // Enforce our own max length instead of relying on JSON Schema features
      // that some providers (like Anthropic tools) don't support.
      return object.suggestions.slice(0, MAX_SUGGESTIONS);
    } catch (err) {
      this.logger.error('Web content suggestion generation failed', err);
      this.eventBus.emitLlm({
        kind: 'web-content',
        model: CHAT_MODEL,
        success: false,
        durationMs: Date.now() - started,
        errorName: err instanceof Error ? err.name : 'UnknownError',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}
