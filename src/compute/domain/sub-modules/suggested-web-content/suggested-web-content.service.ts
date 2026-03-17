import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { SuggestedWebContentRecordRepository } from '../../../infrastructure/repositories/suggested-web-content-record.repository';
import type { NoteId } from '../../../../notes/domain/entities/note.entity';
import { DomainEventBus } from '../../../../common/events/domain-event-bus.service';

const CHAT_MODEL = 'gpt-4o-mini';
const MAX_SUGGESTIONS = 3;

const WebContentSuggestionSchema = z.object({
  suggestions: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
      }),
    )
    .max(MAX_SUGGESTIONS),
});

type WebContentSuggestion = z.infer<
  typeof WebContentSuggestionSchema
>['suggestions'][number];

@Injectable()
export class SuggestedWebContentService {
  private readonly logger = new Logger(SuggestedWebContentService.name);

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
    const suggestions = await this.fetchWebContentSuggestions(title, content);
    await this.suggestedWebContentRecordRepository.replaceForNote(
      noteId,
      suggestions.map((s) => ({
        webContentUrl: s.url,
        webContentTitle: s.title,
      })),
    );
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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not set; skipping web content suggestions.',
      );
      this.eventBus.emitLlm({
        kind: 'web-content',
        model: CHAT_MODEL,
        success: false,
        durationMs: 0,
        errorName: 'MissingOpenAiApiKey',
        errorMessage: 'OPENAI_API_KEY is not set.',
      });
      return [];
    }

    const notePreview = content.slice(0, 500);
    const started = Date.now();
    try {
      const { object } = await generateObject({
        model: openai(CHAT_MODEL),
        schema: WebContentSuggestionSchema,
        prompt: `You are a research assistant. Based on the following note, suggest up to ${MAX_SUGGESTIONS} relevant web resources a reader might find useful. Include a mix of types such as articles, blog posts, YouTube videos, or documentation pages. Do not suggest websites known primarily for explicit content. Return only real, publicly accessible URLs with accurate titles.

Note title: ${title}

Note content (preview):
${notePreview}

Return an array of up to ${MAX_SUGGESTIONS} objects, each with a "url" and "title" field.`,
      });
      this.eventBus.emitLlm({
        kind: 'web-content',
        model: CHAT_MODEL,
        success: true,
        durationMs: Date.now() - started,
      });
      return object.suggestions;
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
