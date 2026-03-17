import { NoteRepository } from '../../../../infrastructure/repositories/note.repository';
import { NoteNotFoundException } from '../../../exceptions/note-not-found.exception';
import { UpdateNoteTS } from '../update-note.transaction.script';
import type { Note, NoteId } from '../../../entities/note.entity';
import type { UserId } from '../../../../../users/domain/entities/user.entity';

const buildNoteMock = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 1 as NoteId,
    ownedByUserId: 10 as UserId,
    title: 'Original Title',
    content: 'Original content',
    lastModifiedDate: new Date('2024-06-01'),
    ...overrides,
  }) as Note;

describe('UpdateNoteTS', () => {
  let target: UpdateNoteTS;
  let noteRepositoryMock: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    noteRepositoryMock = {
      findOneByIdAndUserId: jest.fn(),
      updateNote: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    target = new UpdateNoteTS(noteRepositoryMock);
  });

  describe('given a note that belongs to the user', () => {
    it('when apply is called, then it returns the updated note as a DTO', async () => {
      // Arrange
      const inputNote = buildNoteMock();
      const inputTitle = 'Updated Title';
      const inputContent = 'Updated content';
      const mockUpdated = buildNoteMock({
        title: inputTitle,
        content: inputContent,
      });

      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(inputNote);
      noteRepositoryMock.updateNote.mockResolvedValue(mockUpdated);

      // Act
      const actualResult = await target.apply({
        noteId: 1 as NoteId,
        userId: 10 as UserId,
        title: inputTitle,
        content: inputContent,
      });

      // Assert
      expect(actualResult.title).toBe(inputTitle);
      expect(actualResult.content).toBe(inputContent);
    });

    it('when apply is called, then updateNote is called with the found note and new values', async () => {
      // Arrange
      const inputNote = buildNoteMock();
      const inputTitle = 'Updated Title';
      const inputContent = 'Updated content';

      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(inputNote);
      noteRepositoryMock.updateNote.mockResolvedValue(
        buildNoteMock({ title: inputTitle, content: inputContent }),
      );

      // Act
      await target.apply({
        noteId: 1 as NoteId,
        userId: 10 as UserId,
        title: inputTitle,
        content: inputContent,
      });

      // Assert
      const updateNoteSpy = jest.mocked(noteRepositoryMock.updateNote);
      expect(updateNoteSpy).toHaveBeenNthCalledWith(
        1,
        inputNote,
        inputTitle,
        inputContent,
      );
    });
  });

  describe('given a note that does not belong to the user', () => {
    it('when apply is called, then it throws NoteNotFoundException', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        target.apply({
          noteId: 99 as NoteId,
          userId: 10 as UserId,
          title: 'T',
          content: 'C',
        }),
      ).rejects.toThrow(NoteNotFoundException);
    });

    it('when apply is called, then updateNote is never called', async () => {
      // Arrange
      noteRepositoryMock.findOneByIdAndUserId.mockResolvedValue(null);

      // Act
      await expect(
        target.apply({
          noteId: 99 as NoteId,
          userId: 10 as UserId,
          title: 'T',
          content: 'C',
        }),
      ).rejects.toThrow();

      // Assert
      const updateNoteSpy = jest.mocked(noteRepositoryMock.updateNote);
      expect(updateNoteSpy).not.toHaveBeenCalled();
    });
  });
});
