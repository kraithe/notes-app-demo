import { NoteRepository } from '../../../../infrastructure/repositories/note.repository';
import { CreateNoteTS } from '../create-note.transaction.script';
import type { Note, NoteId } from '../../../entities/note.entity';
import type { UserId } from '../../../../../users/domain/entities/user.entity';

const buildNoteMock = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 1 as NoteId,
    ownedByUserId: 10 as UserId,
    title: 'Test Title',
    content: 'Test content',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  }) as Note;

describe('CreateNoteTS', () => {
  let target: CreateNoteTS;
  let noteRepositoryMock: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    noteRepositoryMock = {
      createNote: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    target = new CreateNoteTS(noteRepositoryMock);
  });

  describe('given valid create parameters', () => {
    it('when apply is called, then it returns the created note as a DTO', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputTitle = 'My Note';
      const inputContent = 'Note content here';
      const mockNote = buildNoteMock({
        ownedByUserId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });
      noteRepositoryMock.createNote.mockResolvedValue(mockNote);

      // Act
      const actualResult = await target.apply({
        userId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });

      // Assert
      expect(actualResult.id).toBe(mockNote.id);
      expect(actualResult.ownedByUserId).toBe(inputUserId);
      expect(actualResult.title).toBe(inputTitle);
      expect(actualResult.content).toBe(inputContent);
      expect(actualResult.lastModifiedDate).toEqual(mockNote.lastModifiedDate);
    });

    it('when apply is called, then createNote receives the correct userId, title, and content', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputTitle = 'My Note';
      const inputContent = 'Note content here';
      noteRepositoryMock.createNote.mockResolvedValue(buildNoteMock());

      // Act
      await target.apply({
        userId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });

      // Assert
      const createNoteSpy = jest.mocked(noteRepositoryMock.createNote);
      expect(createNoteSpy).toHaveBeenNthCalledWith(
        1,
        inputUserId,
        inputTitle,
        inputContent,
      );
    });

    it('when apply is called, then createNote is called exactly once', async () => {
      // Arrange
      noteRepositoryMock.createNote.mockResolvedValue(buildNoteMock());

      // Act
      await target.apply({ userId: 10 as UserId, title: 'T', content: 'C' });

      // Assert
      const createNoteSpy = jest.mocked(noteRepositoryMock.createNote);
      expect(createNoteSpy).toHaveBeenCalledTimes(1);
    });
  });
});
