import { NoteRepository } from '../../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../../exceptions/note-not-found.exception';
import { GetNoteTS } from '../get-note.transaction.script';
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

describe('GetNoteTS', () => {
  let target: GetNoteTS;
  let noteRepositoryMock: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    noteRepositoryMock = {
      findOneByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    target = new GetNoteTS(noteRepositoryMock);
  });

  describe('given a note that belongs to the user', () => {
    it('when apply is called, then it returns the full note data', async () => {
      // Arrange
      const inputNote = buildNoteMock({ id: 5 as NoteId, ownedByUserId: 10 as UserId });
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(inputNote);

      // Act
      const actualResult = await target.apply({ noteId: 5 as NoteId, userId: 10 as UserId });

      // Assert
      expect(actualResult.id).toBe(5);
      expect(actualResult.ownedByUserId).toBe(10);
      expect(actualResult.title).toBe(inputNote.title);
      expect(actualResult.content).toBe(inputNote.content);
      expect(actualResult.lastModifiedDate).toEqual(inputNote.lastModifiedDate);
    });
  });

  describe('given a note that does not exist for the user', () => {
    it('when apply is called, then it throws NoteNotFoundException', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        target.apply({ noteId: 99 as NoteId, userId: 10 as UserId }),
      ).rejects.toThrow(NoteNotFoundException);
    });

    it('when apply is called, then the exception message includes the note id', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        target.apply({ noteId: 99 as NoteId, userId: 10 as UserId }),
      ).rejects.toThrow('Note with ID 99 was not found.');
    });
  });

  it('when apply is called, then findOneByIdAndUserId receives the correct noteId and userId', async () => {
    // Arrange
    const inputNoteId = 7 as NoteId;
    const inputUserId = 42 as UserId;
    noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(buildNoteMock());

    // Act
    await target.apply({ noteId: inputNoteId, userId: inputUserId });

    // Assert
    expect(noteRepositoryMock.findOneByIdAndUserId).toHaveBeenNthCalledWith(1, inputNoteId, inputUserId);
  });
});
