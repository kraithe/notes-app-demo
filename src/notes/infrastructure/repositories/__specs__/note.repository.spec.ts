import { Repository } from 'typeorm';
import { Note, NoteId } from '../../../domain/entities/note.entity';
import { NoteRepository } from '../note.repository';
import type { UserId } from '../../../../users/domain/entities/user.entity';

const buildNoteMock = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 1 as NoteId,
    ownedByUserId: 10 as UserId,
    title: 'Test Title',
    content: 'Test content',
    lastModifiedDate: new Date('2024-01-01'),
    ...overrides,
  }) as Note;

describe('NoteRepository', () => {
  let target: NoteRepository;
  let typeOrmRepoMock: jest.Mocked<Repository<Note>>;

  beforeEach(() => {
    typeOrmRepoMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Note>>;

    target = new NoteRepository(typeOrmRepoMock);
  });

  describe('findAllByUserId', () => {
    it('when called, then it queries with the correct userId and DESC order', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      typeOrmRepoMock.find.mockResolvedValue([]);

      // Act
      await target.findAllByUserId(inputUserId);

      // Assert
      expect(typeOrmRepoMock.find).toHaveBeenNthCalledWith(1, {
        where: { ownedByUserId: inputUserId },
        order: { lastModifiedDate: 'DESC' },
      });
    });

    it('when notes exist, then it returns all notes for the user', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const expectedNotes = [buildNoteMock(), buildNoteMock({ id: 2 as NoteId })];
      typeOrmRepoMock.find.mockResolvedValue(expectedNotes);

      // Act
      const actualResult = await target.findAllByUserId(inputUserId);

      // Assert
      expect(actualResult).toEqual(expectedNotes);
    });

    it('when no notes exist, then it returns an empty array', async () => {
      // Arrange
      typeOrmRepoMock.find.mockResolvedValue([]);

      // Act
      const actualResult = await target.findAllByUserId(10 as UserId);

      // Assert
      expect(actualResult).toHaveLength(0);
    });
  });

  describe('findOneByIdAndUserId', () => {
    it('when a matching note exists, then it returns the note', async () => {
      // Arrange
      const inputNoteId = 1 as NoteId;
      const inputUserId = 10 as UserId;
      const expectedNote = buildNoteMock();
      typeOrmRepoMock.findOneBy.mockResolvedValue(expectedNote);

      // Act
      const actualResult = await target.findOneByIdAndUserId(inputNoteId, inputUserId);

      // Assert
      expect(actualResult).toEqual(expectedNote);
    });

    it('when no matching note exists, then it returns null', async () => {
      // Arrange
      typeOrmRepoMock.findOneBy.mockResolvedValue(null);

      // Act
      const actualResult = await target.findOneByIdAndUserId(99 as NoteId, 10 as UserId);

      // Assert
      expect(actualResult).toBeNull();
    });

    it('when called, then it queries with both noteId and userId', async () => {
      // Arrange
      const inputNoteId = 5 as NoteId;
      const inputUserId = 20 as UserId;
      typeOrmRepoMock.findOneBy.mockResolvedValue(null);

      // Act
      await target.findOneByIdAndUserId(inputNoteId, inputUserId);

      // Assert
      expect(typeOrmRepoMock.findOneBy).toHaveBeenNthCalledWith(1, {
        id: inputNoteId,
        ownedByUserId: inputUserId,
      });
    });
  });

  describe('createNote', () => {
    it('when called, then it saves and returns the created note', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputTitle = 'New Title';
      const inputContent = 'New content';
      const mockCreated = buildNoteMock({ title: inputTitle, content: inputContent });
      typeOrmRepoMock.create.mockReturnValue(mockCreated);
      typeOrmRepoMock.save.mockResolvedValue(mockCreated);

      // Act
      const actualResult = await target.createNote(inputUserId, inputTitle, inputContent);

      // Assert
      expect(actualResult).toEqual(mockCreated);
    });

    it('when called, then create receives the correct userId, title, and content', async () => {
      // Arrange
      const inputUserId = 10 as UserId;
      const inputTitle = 'New Title';
      const inputContent = 'New content';
      const mockCreated = buildNoteMock();
      typeOrmRepoMock.create.mockReturnValue(mockCreated);
      typeOrmRepoMock.save.mockResolvedValue(mockCreated);

      // Act
      await target.createNote(inputUserId, inputTitle, inputContent);

      // Assert
      expect(typeOrmRepoMock.create).toHaveBeenNthCalledWith(1, {
        ownedByUserId: inputUserId,
        title: inputTitle,
        content: inputContent,
      });
    });
  });

  describe('updateNote', () => {
    it('when called, then it mutates title and content on the note before saving', async () => {
      // Arrange
      const inputNote = buildNoteMock({ title: 'Old Title', content: 'Old content' });
      const inputTitle = 'Updated Title';
      const inputContent = 'Updated content';
      typeOrmRepoMock.save.mockResolvedValue({ ...inputNote, title: inputTitle, content: inputContent } as Note);

      // Act
      await target.updateNote(inputNote, inputTitle, inputContent);

      // Assert
      expect(typeOrmRepoMock.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ title: inputTitle, content: inputContent }),
      );
    });

    it('when called, then it returns the saved note', async () => {
      // Arrange
      const inputNote = buildNoteMock();
      const expectedNote = buildNoteMock({ title: 'New Title' });
      typeOrmRepoMock.save.mockResolvedValue(expectedNote);

      // Act
      const actualResult = await target.updateNote(inputNote, 'New Title', 'content');

      // Assert
      expect(actualResult).toEqual(expectedNote);
    });
  });

  describe('deleteNote', () => {
    it('when called, then it removes the note', async () => {
      // Arrange
      const inputNote = buildNoteMock();
      typeOrmRepoMock.remove.mockResolvedValue(inputNote);

      // Act
      await target.deleteNote(inputNote);

      // Assert
      expect(typeOrmRepoMock.remove).toHaveBeenNthCalledWith(1, inputNote);
    });
  });
});
