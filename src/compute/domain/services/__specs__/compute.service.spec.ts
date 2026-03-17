/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Logger } from '@nestjs/common';
import { ComputeService, type NoteComputeContext } from '../compute.service';
import { RelatedNotesService } from '../../sub-modules/related-notes/related-notes.service';
import { SuggestedWebContentService } from '../../sub-modules/suggested-web-content/suggested-web-content.service';
import type { NoteId } from '../../../notes/domain/entities/note.entity';
import type { UserId } from '../../../users/domain/entities/user.entity';

describe('ComputeService', () => {
  let target: ComputeService;
  let relatedNotesServiceMock: jest.Mocked<RelatedNotesService>;
  let suggestedWebContentServiceMock: jest.Mocked<SuggestedWebContentService>;
  let loggerErrorSpy: jest.SpyInstance;

  const buildContext = (
    overrides: Partial<NoteComputeContext> = {},
  ): NoteComputeContext => ({
    noteId: 1 as NoteId,
    userId: 10 as UserId,
    title: 'Title',
    content: 'Content',
    ...overrides,
  });

  beforeEach(() => {
    relatedNotesServiceMock = {
      recomputeForUser: jest.fn().mockResolvedValue(undefined),
      removeEmbeddingForNote: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RelatedNotesService>;

    suggestedWebContentServiceMock = {
      recomputeForNote: jest.fn().mockResolvedValue(undefined),
      deleteForNote: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SuggestedWebContentService>;

    target = new ComputeService(
      relatedNotesServiceMock,
      suggestedWebContentServiceMock,
    );

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('afterNoteUpsert', () => {
    it('when invoked, then it recomputes related notes and suggested web content in parallel', async () => {
      // Arrange
      const context = buildContext();

      // Act
      await target.afterNoteUpsert(context);

      // Assert
      expect(relatedNotesServiceMock.recomputeForUser).toHaveBeenCalledWith(
        context.noteId,
        context.userId,
      );
      expect(
        suggestedWebContentServiceMock.recomputeForNote,
      ).toHaveBeenCalledWith(context.noteId, context.title, context.content);
    });

    it('given related notes recompute fails, when invoked, then the error is logged and web content still runs', async () => {
      // Arrange
      const context = buildContext({ noteId: 5 as NoteId });
      const error = new Error('Related notes failed');
      relatedNotesServiceMock.recomputeForUser.mockRejectedValueOnce(error);

      // Act
      await target.afterNoteUpsert(context);

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'RelatedNotes recompute failed for note 5',
        error,
      );
      expect(
        suggestedWebContentServiceMock.recomputeForNote,
      ).toHaveBeenCalledWith(context.noteId, context.title, context.content);
    });

    it('given web content recompute fails, when invoked, then the error is logged and related notes still run', async () => {
      // Arrange
      const context = buildContext({ noteId: 7 as NoteId });
      const error = new Error('Web content failed');
      suggestedWebContentServiceMock.recomputeForNote.mockRejectedValueOnce(
        error,
      );

      // Act
      await target.afterNoteUpsert(context);

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'WebContent recompute failed for note 7',
        error,
      );
      expect(relatedNotesServiceMock.recomputeForUser).toHaveBeenCalledWith(
        context.noteId,
        context.userId,
      );
    });
  });

  describe('afterNoteDeleted', () => {
    it('when invoked, then it removes related records and deletes suggested web content in parallel', async () => {
      // Arrange
      const noteId = 3 as NoteId;
      const userId = 20 as UserId;

      // Act
      await target.afterNoteDeleted(noteId, userId);

      // Assert
      expect(
        relatedNotesServiceMock.removeEmbeddingForNote,
      ).toHaveBeenCalledWith(noteId, userId);
      expect(suggestedWebContentServiceMock.deleteForNote).toHaveBeenCalledWith(
        noteId,
      );
    });

    it('given related notes cleanup fails, when invoked, then the error is logged and web content cleanup still runs', async () => {
      // Arrange
      const noteId = 9 as NoteId;
      const userId = 30 as UserId;
      const error = new Error('Cleanup failed');
      relatedNotesServiceMock.removeEmbeddingForNote.mockRejectedValueOnce(
        error,
      );

      // Act
      await target.afterNoteDeleted(noteId, userId);

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'RelatedNotes cleanup failed for deleted note 9',
        error,
      );
      expect(suggestedWebContentServiceMock.deleteForNote).toHaveBeenCalledWith(
        noteId,
      );
    });

    it('given web content cleanup fails, when invoked, then the error is logged and related notes cleanup still runs', async () => {
      // Arrange
      const noteId = 11 as NoteId;
      const userId = 40 as UserId;
      const error = new Error('Web cleanup failed');
      suggestedWebContentServiceMock.deleteForNote.mockRejectedValueOnce(error);

      // Act
      await target.afterNoteDeleted(noteId, userId);

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'WebContent cleanup failed for deleted note 11',
        error,
      );
      expect(
        relatedNotesServiceMock.removeEmbeddingForNote,
      ).toHaveBeenCalledWith(noteId, userId);
    });
  });
});
