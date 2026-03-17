import { NoteRepository } from '../../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../../exceptions/note-not-found.exception';
import { DeleteNoteTS } from '../delete-note.transaction.script';
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

describe('DeleteNoteTS', () => {
  let target: DeleteNoteTS;
  let noteRepositoryMock: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    noteRepositoryMock = {
      findOneByIdAndUserId: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    target = new DeleteNoteTS(noteRepositoryMock);
  });

  describe('given a note that belongs to the user', () => {
    it('when apply is called, then deleteNote is called with the found note', async () => {
      // Arrange
      const inputNote = buildNoteMock();
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(inputNote);
      noteRepositoryMock.deleteNote.mockResolvedValue(undefined);

      // Act
      await target.apply({ noteId: 1 as NoteId, userId: 10 as UserId });

      // Assert
      const deleteNoteSpy = jest.mocked(noteRepositoryMock.deleteNote);
      expect(deleteNoteSpy).toHaveBeenNthCalledWith(1, inputNote);
    });

    it('when apply is called, then it resolves without returning a value', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(
        buildNoteMock(),
      );
      noteRepositoryMock.deleteNote.mockResolvedValue(undefined);

      // Act
      const actualResult = await target.apply({
        noteId: 1 as NoteId,
        userId: 10 as UserId,
      });

      // Assert
      expect(actualResult).toBeUndefined();
    });
  });

  describe('given a note that does not belong to the user', () => {
    it('when apply is called, then it throws NoteNotFoundException', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        target.apply({ noteId: 99 as NoteId, userId: 10 as UserId }),
      ).rejects.toThrow(NoteNotFoundException);
    });

    it('when apply is called, then deleteNote is never called', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act
      await expect(
        target.apply({ noteId: 99 as NoteId, userId: 10 as UserId }),
      ).rejects.toThrow();

      // Assert
      const deleteNoteSpy = jest.mocked(noteRepositoryMock.deleteNote);
      expect(deleteNoteSpy).not.toHaveBeenCalled();
    });
  });
});
