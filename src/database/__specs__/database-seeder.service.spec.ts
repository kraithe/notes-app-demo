import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DatabaseSeederService } from '../database-seeder.service';
import { User, UserId } from '../../users/domain/entities/user.entity';
import { Note, NoteId } from '../../notes/domain/entities/note.entity';

const buildUserMock = (overrides: Partial<User> = {}): User =>
  ({ id: 1 as UserId, name: 'DemoUser', password: '$2b$10$hashed', ...overrides }) as User;

const buildNoteMock = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 1 as NoteId,
    ownedByUserId: 1 as UserId,
    title: 'Test Note',
    content: 'Test content',
    lastModifiedDate: new Date(),
    ...overrides,
  }) as Note;

describe('DatabaseSeederService', () => {
  let target: DatabaseSeederService;
  let userRepoMock: jest.Mocked<Repository<User>>;
  let noteRepoMock: jest.Mocked<Repository<Note>>;

  beforeEach(() => {
    userRepoMock = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    noteRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Note>>;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    target = new DatabaseSeederService(userRepoMock, noteRepoMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('given the database already has users', () => {
    it('when onApplicationBootstrap is called, then no users are created', async () => {
      // Arrange
      userRepoMock.count.mockResolvedValue(1);

      // Act
      await target.onApplicationBootstrap();

      // Assert
      expect(userRepoMock.save).not.toHaveBeenCalled();
    });

    it('when onApplicationBootstrap is called, then no notes are created', async () => {
      // Arrange
      userRepoMock.count.mockResolvedValue(3);

      // Act
      await target.onApplicationBootstrap();

      // Assert
      expect(noteRepoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('given the database is empty', () => {
    beforeEach(() => {
      const mockUser = buildUserMock();
      userRepoMock.count.mockResolvedValue(0);
      userRepoMock.create.mockReturnValue(mockUser);
      userRepoMock.save.mockResolvedValue(mockUser);
      noteRepoMock.create.mockImplementation((data) => buildNoteMock(data as Partial<Note>));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (noteRepoMock.save as jest.MockedFunction<any>).mockResolvedValue([]);
    });

    it('when onApplicationBootstrap is called, then exactly one user is created', async () => {
      // Act
      await target.onApplicationBootstrap();

      // Assert
      expect(userRepoMock.save).toHaveBeenCalledTimes(1);
    });

    it('when onApplicationBootstrap is called, then exactly three notes are saved', async () => {
      // Act
      await target.onApplicationBootstrap();
      const savedNotes = noteRepoMock.save.mock.calls[0][0] as Note[];

      // Assert
      expect(savedNotes).toHaveLength(3);
    });

    it('when onApplicationBootstrap is called, then the user password is stored as a bcrypt hash', async () => {
      // Act
      await target.onApplicationBootstrap();
      const createdUserArg = userRepoMock.create.mock.calls[0][0] as Partial<User>;

      // Assert
      expect(createdUserArg.password).toBeDefined();
      const isValidHash = await bcrypt.compare('!falsyTruthy789', createdUserArg.password!);
      expect(isValidHash).toBe(true);
    });

    it('when onApplicationBootstrap is called, then each note is associated with the seeded user id', async () => {
      // Arrange
      const mockUser = buildUserMock({ id: 7 as UserId });
      userRepoMock.create.mockReturnValue(mockUser);
      userRepoMock.save.mockResolvedValue(mockUser);

      // Act
      await target.onApplicationBootstrap();
      const savedNotes = noteRepoMock.save.mock.calls[0][0] as Note[];

      // Assert
      savedNotes.forEach((note) => {
        expect(note.ownedByUserId).toBe(7);
      });
    });
  });
});
