import { Repository } from 'typeorm';
import { User, UserId } from '../../../domain/entities/user.entity';
import { UserRepository } from '../user.repository';

const buildUserMock = (overrides: Partial<User> = {}): User =>
  ({
    id: 1 as UserId,
    name: 'testuser',
    password: '$2b$10$hashed',
    ...overrides,
  }) as User;

describe('UserRepository', () => {
  let target: UserRepository;
  let typeOrmRepoMock: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    typeOrmRepoMock = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    target = new UserRepository(typeOrmRepoMock);
  });

  describe('findById', () => {
    describe('given a user exists with that id', () => {
      it('when findById is called, then it returns the user', async () => {
        // Arrange
        const inputId = 1 as UserId;
        const expectedUser = buildUserMock({ id: inputId });
        typeOrmRepoMock.findOneBy.mockResolvedValue(expectedUser);

        // Act
        const actualResult = await target.findById(inputId);

        // Assert
        expect(actualResult).toEqual(expectedUser);
      });
    });

    describe('given no user exists with that id', () => {
      it('when findById is called, then it returns null', async () => {
        // Arrange
        const inputId = 999 as UserId;
        typeOrmRepoMock.findOneBy.mockResolvedValue(null);

        // Act
        const actualResult = await target.findById(inputId);

        // Assert
        expect(actualResult).toBeNull();
      });
    });

    it('when findById is called, then it queries by the correct id', async () => {
      // Arrange
      const inputId = 42 as UserId;
      typeOrmRepoMock.findOneBy.mockResolvedValue(null);

      // Act
      await target.findById(inputId);

      // Assert
      const findOneBySpy = jest.mocked(typeOrmRepoMock.findOneBy);
      expect(findOneBySpy).toHaveBeenNthCalledWith(1, { id: inputId });
    });
  });

  describe('findByUsername', () => {
    describe('given a user exists with that username', () => {
      it('when findByUsername is called, then it returns the user', async () => {
        // Arrange
        const inputUsername = 'testuser';
        const expectedUser = buildUserMock({ name: inputUsername });
        typeOrmRepoMock.findOneBy.mockResolvedValue(expectedUser);

        // Act
        const actualResult = await target.findByUsername(inputUsername);

        // Assert
        expect(actualResult).toEqual(expectedUser);
      });
    });

    describe('given no user exists with that username', () => {
      it('when findByUsername is called, then it returns null', async () => {
        // Arrange
        typeOrmRepoMock.findOneBy.mockResolvedValue(null);

        // Act
        const actualResult = await target.findByUsername('unknown');

        // Assert
        expect(actualResult).toBeNull();
      });
    });

    it('when findByUsername is called, then it queries by name field', async () => {
      // Arrange
      const inputUsername = 'queryuser';
      typeOrmRepoMock.findOneBy.mockResolvedValue(null);

      // Act
      await target.findByUsername(inputUsername);

      // Assert
      const findOneBySpy = jest.mocked(typeOrmRepoMock.findOneBy);
      expect(findOneBySpy).toHaveBeenNthCalledWith(1, { name: inputUsername });
    });
  });

  describe('createUser', () => {
    it('when createUser is called, then it saves and returns the new user', async () => {
      // Arrange
      const inputUsername = 'newuser';
      const inputHashedPassword = '$2b$10$newhash';
      const mockCreated = buildUserMock({
        name: inputUsername,
        password: inputHashedPassword,
      });
      const mockSaved = buildUserMock({ id: 5 as UserId, name: inputUsername });

      typeOrmRepoMock.create.mockReturnValue(mockCreated);
      typeOrmRepoMock.save.mockResolvedValue(mockSaved);

      // Act
      const actualResult = await target.createUser(
        inputUsername,
        inputHashedPassword,
      );

      // Assert
      expect(actualResult).toEqual(mockSaved);
    });

    it('when createUser is called, then create is called with correct name and password', async () => {
      // Arrange
      const inputUsername = 'newuser';
      const inputHashedPassword = '$2b$10$newhash';
      const mockCreated = buildUserMock();

      typeOrmRepoMock.create.mockReturnValue(mockCreated);
      typeOrmRepoMock.save.mockResolvedValue(mockCreated);

      // Act
      await target.createUser(inputUsername, inputHashedPassword);

      // Assert
      const createSpy = jest.mocked(typeOrmRepoMock.create);
      expect(createSpy).toHaveBeenNthCalledWith(1, {
        name: inputUsername,
        password: inputHashedPassword,
      });
    });
  });
});
