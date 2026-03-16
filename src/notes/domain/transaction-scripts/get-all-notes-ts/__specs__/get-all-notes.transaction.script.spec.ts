import { NoteRepository } from '../../../../infrastructure/repositories/note.repository';
import { GetAllNotesTS } from '../get-all-notes.transaction.script';
import type { Note, NoteId } from '../../../entities/note.entity';
import type { UserId } from '../../../../../users/domain/entities/user.entity';

const buildNoteMock = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 1 as NoteId,
    ownedByUserId: 10 as UserId,
    title: 'A title longer than thirty characters for testing',
    content: 'Some content longer than thirty characters for testing',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  }) as Note;

describe('GetAllNotesTS', () => {
  let target: GetAllNotesTS;
  let noteRepositoryMock: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    noteRepositoryMock = {
      findAllByUserId: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    target = new GetAllNotesTS(noteRepositoryMock);
  });

  describe('given the user has notes', () => {
    it('when apply is called, then it returns a summary for each note', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputNotes = [buildNoteMock({ id: 1 as NoteId }), buildNoteMock({ id: 2 as NoteId })];
      noteRepositoryMock.findAllByUserId.mockResolvedValue(inputNotes);

      // Act
      const actualResult = await target.apply({ userId: inputUserId });

      // Assert
      expect(actualResult).toHaveLength(2);
    });

    it('when apply is called, then title fields longer than 30 chars are truncated with ellipsis', async () => {
      // Arrange
      const inputNote = buildNoteMock({ title: 'A'.repeat(35) });
      noteRepositoryMock.findAllByUserId.mockResolvedValue([inputNote]);

      // Act
      const actualResult = await target.apply({ userId: 10 as UserId });

      // Assert
      expect(actualResult[0].titlePreview).toBe('A'.repeat(30) + '…');
    });

    it('when apply is called, then content fields longer than 30 chars are truncated with ellipsis', async () => {
      // Arrange
      const inputNote = buildNoteMock({ content: 'B'.repeat(40) });
      noteRepositoryMock.findAllByUserId.mockResolvedValue([inputNote]);

      // Act
      const actualResult = await target.apply({ userId: 10 as UserId });

      // Assert
      expect(actualResult[0].contentPreview).toBe('B'.repeat(30) + '…');
    });

    it('when apply is called, then short titles are not truncated', async () => {
      // Arrange
      const inputNote = buildNoteMock({ title: 'Short' });
      noteRepositoryMock.findAllByUserId.mockResolvedValue([inputNote]);

      // Act
      const actualResult = await target.apply({ userId: 10 as UserId });

      // Assert
      expect(actualResult[0].titlePreview).toBe('Short');
    });

    it('when apply is called, then each summary includes the correct id, ownedByUserId, and lastModifiedDate', async () => {
      // Arrange
      const inputDate = new Date('2024-06-01');
      const inputNote = buildNoteMock({ id: 7 as NoteId, ownedByUserId: 42 as UserId, lastModifiedDate: inputDate });
      noteRepositoryMock.findAllByUserId.mockResolvedValue([inputNote]);

      // Act
      const actualResult = await target.apply({ userId: 42 as UserId });

      // Assert
      expect(actualResult[0].id).toBe(7);
      expect(actualResult[0].ownedByUserId).toBe(42);
      expect(actualResult[0].lastModifiedDate).toEqual(inputDate);
    });
  });

  describe('given the user has no notes', () => {
    it('when apply is called, then it returns an empty array', async () => {
      // Arrange
      noteRepositoryMock.findAllByUserId.mockResolvedValue([]);

      // Act
      const actualResult = await target.apply({ userId: 10 as UserId });

      // Assert
      expect(actualResult).toHaveLength(0);
    });
  });

  it('when apply is called, then findAllByUserId receives the correct userId', async () => {
    // Arrange
    const inputUserId = 99 as UserId;
    noteRepositoryMock.findAllByUserId.mockResolvedValue([]);

    // Act
    await target.apply({ userId: inputUserId });

    // Assert
    expect(noteRepositoryMock.findAllByUserId).toHaveBeenNthCalledWith(1, inputUserId);
  });
});
