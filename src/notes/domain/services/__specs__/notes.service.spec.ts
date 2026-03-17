import { NotesService } from '../notes.service';
import { GetAllNotesTS } from '../../transaction-scripts/get-all-notes-ts/get-all-notes.transaction.script';
import { GetNoteTS } from '../../transaction-scripts/get-note-ts/get-note.transaction.script';
import { CreateNoteTS } from '../../transaction-scripts/create-note-ts/create-note.transaction.script';
import { UpdateNoteTS } from '../../transaction-scripts/update-note-ts/update-note.transaction.script';
import { DeleteNoteTS } from '../../transaction-scripts/delete-note-ts/delete-note.transaction.script';
import { ComputeService } from '../../../../compute/domain/services/compute.service';
import { NoteSummaryResponseDto } from '../../../application/dtos/responses/note-summary.response.dto';
import { NoteResponseDto } from '../../../application/dtos/responses/note.response.dto';
import type { NoteId } from '../../entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';

const buildSummaryMock = (overrides: Partial<NoteSummaryResponseDto> = {}): NoteSummaryResponseDto =>
  Object.assign(new NoteSummaryResponseDto(), {
    id: 1,
    ownedByUserId: 10,
    titlePreview: 'Preview title',
    contentPreview: 'Preview content',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  });

const buildNoteDtoMock = (overrides: Partial<NoteResponseDto> = {}): NoteResponseDto =>
  Object.assign(new NoteResponseDto(), {
    id: 1,
    ownedByUserId: 10,
    title: 'Full Title',
    content: 'Full content',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  });

describe('NotesService', () => {
  let target: NotesService;
  let getAllNotesTSMock: jest.Mocked<GetAllNotesTS>;
  let getNotesTSMock: jest.Mocked<GetNoteTS>;
  let createNoteTSMock: jest.Mocked<CreateNoteTS>;
  let updateNoteTSMock: jest.Mocked<UpdateNoteTS>;
  let deleteNoteTSMock: jest.Mocked<DeleteNoteTS>;
  let computeServiceMock: jest.Mocked<ComputeService>;

  beforeEach(() => {
    getAllNotesTSMock = { apply: jest.fn() } as unknown as jest.Mocked<GetAllNotesTS>;
    getNotesTSMock = { apply: jest.fn() } as unknown as jest.Mocked<GetNoteTS>;
    createNoteTSMock = { apply: jest.fn() } as unknown as jest.Mocked<CreateNoteTS>;
    updateNoteTSMock = { apply: jest.fn() } as unknown as jest.Mocked<UpdateNoteTS>;
    deleteNoteTSMock = { apply: jest.fn() } as unknown as jest.Mocked<DeleteNoteTS>;
    computeServiceMock = {
      afterNoteUpsert: jest.fn().mockResolvedValue(undefined),
      afterNoteDeleted: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ComputeService>;

    target = new NotesService(
      getAllNotesTSMock,
      getNotesTSMock,
      createNoteTSMock,
      updateNoteTSMock,
      deleteNoteTSMock,
      computeServiceMock,
    );
  });

  describe('getAllNotes', () => {
    describe('given the user has notes', () => {
      it('when called, then it also fetches the full most recent note', async () => {
        // Arrange
        const inputUserId = 10 as UserId;
        const inputSummaries = [buildSummaryMock({ id: 3 }), buildSummaryMock({ id: 1 })];
        const inputMostRecent = buildNoteDtoMock({ id: 3 });

        getAllNotesTSMock.apply.mockResolvedValue(inputSummaries);
        getNotesTSMock.apply.mockResolvedValue(inputMostRecent);

        // Act
        const actualResult = await target.getAllNotes(inputUserId);

        // Assert
        expect(actualResult.mostRecentNote).toEqual(inputMostRecent);
      });

      it('when called, then GetNoteTS is called with the first summary id (most recent)', async () => {
        // Arrange
        const inputUserId = 10 as UserId;
        const inputSummaries = [buildSummaryMock({ id: 7 }), buildSummaryMock({ id: 2 })];

        getAllNotesTSMock.apply.mockResolvedValue(inputSummaries);
        getNotesTSMock.apply.mockResolvedValue(buildNoteDtoMock());

        // Act
        await target.getAllNotes(inputUserId);

        // Assert
        expect(getNotesTSMock.apply).toHaveBeenNthCalledWith(1, {
          noteId: 7,
          userId: inputUserId,
        });
      });

      it('when called, then it returns the note summaries array', async () => {
        // Arrange
        const inputSummaries = [buildSummaryMock(), buildSummaryMock({ id: 2 })];
        getAllNotesTSMock.apply.mockResolvedValue(inputSummaries);
        getNotesTSMock.apply.mockResolvedValue(buildNoteDtoMock());

        // Act
        const actualResult = await target.getAllNotes(10 as UserId);

        // Assert
        expect(actualResult.notes).toEqual(inputSummaries);
      });
    });

    describe('given the user has no notes', () => {
      it('when called, then it returns an empty notes array and null mostRecentNote', async () => {
        // Arrange
        getAllNotesTSMock.apply.mockResolvedValue([]);

        // Act
        const actualResult = await target.getAllNotes(10 as UserId);

        // Assert
        expect(actualResult.notes).toHaveLength(0);
        expect(actualResult.mostRecentNote).toBeNull();
      });

      it('when called, then GetNoteTS is never invoked', async () => {
        // Arrange
        getAllNotesTSMock.apply.mockResolvedValue([]);

        // Act
        await target.getAllNotes(10 as UserId);

        // Assert
        expect(getNotesTSMock.apply).not.toHaveBeenCalled();
      });
    });
  });

  describe('getNote', () => {
    it('when called, then it delegates to GetNoteTS with the correct noteId and userId', async () => {
      // Arrange
      const inputNoteId = 5 as NoteId;
      const inputUserId = 10 as UserId;
      getNotesTSMock.apply.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.getNote(inputNoteId, inputUserId);

      // Assert
      expect(getNotesTSMock.apply).toHaveBeenNthCalledWith(1, { noteId: inputNoteId, userId: inputUserId });
    });
  });

  describe('createNote', () => {
    it('when called, then it delegates to CreateNoteTS with the correct params', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputTitle = 'New note';
      const inputContent = 'Some content';
      createNoteTSMock.apply.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.createNote(inputUserId, inputTitle, inputContent);

      // Assert
      expect(createNoteTSMock.apply).toHaveBeenNthCalledWith(1, {
        userId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });
    });
  });

  describe('updateNote', () => {
    it('when called, then it delegates to UpdateNoteTS with the correct params', async () => {
      // Arrange
      const inputNoteId = 3 as NoteId;
      const inputUserId = 10 as UserId;
      const inputTitle = 'Updated';
      const inputContent = 'Updated content';
      updateNoteTSMock.apply.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.updateNote(inputNoteId, inputUserId, inputTitle, inputContent);

      // Assert
      expect(updateNoteTSMock.apply).toHaveBeenNthCalledWith(1, {
        noteId: inputNoteId,
        userId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });
    });
  });

  describe('deleteNote', () => {
    it('when called, then it delegates to DeleteNoteTS with the correct noteId and userId', async () => {
      // Arrange
      const inputNoteId = 4 as NoteId;
      const inputUserId = 10 as UserId;
      deleteNoteTSMock.apply.mockResolvedValue(undefined);

      // Act
      await target.deleteNote(inputNoteId, inputUserId);

      // Assert
      expect(deleteNoteTSMock.apply).toHaveBeenNthCalledWith(1, { noteId: inputNoteId, userId: inputUserId });
    });
  });
});
