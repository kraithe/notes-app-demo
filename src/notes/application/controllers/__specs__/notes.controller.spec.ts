import { NotesController } from '../notes.controller';
import { NotesService } from '../../../domain/services/notes.service';
import { NoteResponseDto } from '../../dtos/responses/note.response.dto';
import { NoteSummaryResponseDto } from '../../dtos/responses/note-summary.response.dto';
import { GetAllNotesResponseDto } from '../../dtos/responses/get-all-notes.response.dto';
import { CreateNoteDto } from '../../dtos/requests/create-note.dto';
import { UpdateNoteDto } from '../../dtos/requests/update-note.dto';
import type { AuthenticatedUser } from '../../../../auth/domain/strategies/jwt.strategy';
import type { NoteId } from '../../../domain/entities/note.entity';
import type { UserId } from '../../../../users/domain/entities/user.entity';

const buildAuthUserMock = (overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  userId: 10 as UserId,
  username: 'testuser',
  jti: 'test-jti',
  exp: Math.floor(Date.now() / 1000) + 7200,
  ...overrides,
});

const buildRequestMock = (user: AuthenticatedUser): Request & { user: AuthenticatedUser } =>
  ({ user } as Request & { user: AuthenticatedUser });

const buildNoteDtoMock = (overrides: Partial<NoteResponseDto> = {}): NoteResponseDto =>
  Object.assign(new NoteResponseDto(), {
    id: 1,
    ownedByUserId: 10,
    title: 'Full Title',
    content: 'Full content',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  });

const buildSummaryMock = (): NoteSummaryResponseDto =>
  Object.assign(new NoteSummaryResponseDto(), {
    id: 1,
    ownedByUserId: 10,
    titlePreview: 'Preview',
    contentPreview: 'Preview',
    lastModifiedDate: new Date('2024-06-01'),
  });

describe('NotesController', () => {
  let target: NotesController;
  let notesServiceMock: jest.Mocked<NotesService>;

  beforeEach(() => {
    notesServiceMock = {
      getAllNotes: jest.fn(),
      getNote: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as jest.Mocked<NotesService>;

    target = new NotesController(notesServiceMock);
  });

  describe('getAllNotes', () => {
    it('when called, then it delegates to NotesService with the user id from the request', async () => {
      // Arrange
      const inputUser = buildAuthUserMock({ userId: 42 as UserId });
      const inputReq = buildRequestMock(inputUser);
      const expectedResponse: GetAllNotesResponseDto = { notes: [buildSummaryMock()], mostRecentNote: buildNoteDtoMock() };
      notesServiceMock.getAllNotes.mockResolvedValue(expectedResponse);

      // Act
      await target.getAllNotes(inputReq);

      // Assert
      expect(notesServiceMock.getAllNotes).toHaveBeenNthCalledWith(1, 42);
    });

    it('when called, then it returns the response from NotesService', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock());
      const expectedResponse: GetAllNotesResponseDto = { notes: [], mostRecentNote: null };
      notesServiceMock.getAllNotes.mockResolvedValue(expectedResponse);

      // Act
      const actualResult = await target.getAllNotes(inputReq);

      // Assert
      expect(actualResult).toEqual(expectedResponse);
    });
  });

  describe('getNote', () => {
    it('when called, then it delegates to NotesService with the correct id and user id', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock({ userId: 10 as UserId }));
      notesServiceMock.getNote.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.getNote(5, inputReq);

      // Assert
      expect(notesServiceMock.getNote).toHaveBeenNthCalledWith(1, 5, 10);
    });

    it('when called, then it returns the note from NotesService', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock());
      const expectedNote = buildNoteDtoMock({ id: 5 });
      notesServiceMock.getNote.mockResolvedValue(expectedNote);

      // Act
      const actualResult = await target.getNote(5, inputReq);

      // Assert
      expect(actualResult).toEqual(expectedNote);
    });
  });

  describe('createNote', () => {
    it('when called, then it passes sanitized title and content to NotesService', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock({ userId: 10 as UserId }));
      const inputDto: CreateNoteDto = { title: 'My <b>Note</b>', content: '<script>bad</script>Content' };
      notesServiceMock.createNote.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.createNote(inputDto, inputReq);
      const actualTitle = notesServiceMock.createNote.mock.calls[0][1];
      const actualContent = notesServiceMock.createNote.mock.calls[0][2];

      // Assert
      expect(actualTitle).toBe('My Note');
      expect(actualContent).toBe('Content');
    });

    it('when called, then it delegates with the correct userId', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock({ userId: 77 as UserId }));
      const inputDto: CreateNoteDto = { title: 'Title', content: 'Content' };
      notesServiceMock.createNote.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.createNote(inputDto, inputReq);

      // Assert
      expect(notesServiceMock.createNote.mock.calls[0][0]).toBe(77);
    });

    it('when called, then it returns the created note', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock());
      const inputDto: CreateNoteDto = { title: 'Title', content: 'Content' };
      const expectedNote = buildNoteDtoMock();
      notesServiceMock.createNote.mockResolvedValue(expectedNote);

      // Act
      const actualResult = await target.createNote(inputDto, inputReq);

      // Assert
      expect(actualResult).toEqual(expectedNote);
    });
  });

  describe('updateNote', () => {
    it('when called, then it passes sanitized title and content to NotesService', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock());
      const inputDto: UpdateNoteDto = { title: '<em>Title</em>', content: '<img src=x onerror=alert(1)>Content' };
      notesServiceMock.updateNote.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.updateNote(3, inputDto, inputReq);
      const actualTitle = notesServiceMock.updateNote.mock.calls[0][2];
      const actualContent = notesServiceMock.updateNote.mock.calls[0][3];

      // Assert
      expect(actualTitle).toBe('Title');
      expect(actualContent).toBe('Content');
    });

    it('when called, then it delegates with the correct noteId and userId', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock({ userId: 10 as UserId }));
      const inputDto: UpdateNoteDto = { title: 'T', content: 'C' };
      notesServiceMock.updateNote.mockResolvedValue(buildNoteDtoMock());

      // Act
      await target.updateNote(3, inputDto, inputReq);

      // Assert
      expect(notesServiceMock.updateNote.mock.calls[0][0]).toBe(3);
      expect(notesServiceMock.updateNote.mock.calls[0][1]).toBe(10);
    });
  });

  describe('deleteNote', () => {
    it('when called, then it delegates to NotesService with the correct noteId and userId', async () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock({ userId: 10 as UserId }));
      notesServiceMock.deleteNote.mockResolvedValue(undefined);

      // Act
      await target.deleteNote(8, inputReq);

      // Assert
      expect(notesServiceMock.deleteNote).toHaveBeenNthCalledWith(1, 8 as NoteId, 10);
    });
  });
});
