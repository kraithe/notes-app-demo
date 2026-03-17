import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../../infrastructure/repositories/user.repository';
import { UsernameAlreadyExistsException } from '../../../exceptions/username-already-exists.exception';
import { RegisterUserTS } from '../register-user.transaction.script';
import type { User, UserId } from '../../../entities/user.entity';

const buildUserMock = (overrides: Partial<User> = {}): User =>
  ({
    id: 1 as UserId,
    name: 'existinguser',
    password: '$2b$10$hashed',
    ...overrides,
  }) as User;

describe('RegisterUserTS', () => {
  let target: RegisterUserTS;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    target = new RegisterUserTS(userRepositoryMock);
  });

  describe('given a username that does not exist yet', () => {
    it('when apply is called, then createUser is called once', async () => {
      // Arrange
      const inputParam = { username: 'newuser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(null);
      userRepositoryMock.createUser.mockResolvedValue(
        buildUserMock({ name: 'newuser' }),
      );

      // Act
      await target.apply(inputParam);

      // Assert
      const createUserSpy = jest.mocked(userRepositoryMock.createUser);
      expect(createUserSpy).toHaveBeenCalledTimes(1);
    });

    it('when apply is called, then the password stored is a bcrypt hash, not the plain text', async () => {
      // Arrange
      const inputParam = { username: 'newuser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(null);
      userRepositoryMock.createUser.mockResolvedValue(
        buildUserMock({ name: 'newuser' }),
      );

      // Act
      await target.apply(inputParam);
      const actualStoredPassword =
        userRepositoryMock.createUser.mock.calls[0][1];

      // Assert
      expect(actualStoredPassword).not.toBe(inputParam.password);
      const isValidHash = await bcrypt.compare(
        inputParam.password,
        actualStoredPassword,
      );
      expect(isValidHash).toBe(true);
    });

    it('when apply is called, then createUser receives the correct username', async () => {
      // Arrange
      const inputParam = { username: 'newuser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(null);
      userRepositoryMock.createUser.mockResolvedValue(
        buildUserMock({ name: 'newuser' }),
      );

      // Act
      await target.apply(inputParam);

      // Assert
      expect(userRepositoryMock.createUser.mock.calls[0][0]).toBe('newuser');
    });
  });

  describe('given a username that already exists', () => {
    it('when apply is called, then it throws UsernameAlreadyExistsException', async () => {
      // Arrange
      const inputParam = { username: 'existinguser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(buildUserMock());

      // Act & Assert
      await expect(target.apply(inputParam)).rejects.toThrow(
        UsernameAlreadyExistsException,
      );
    });

    it('when apply is called with a taken username, then createUser is never called', async () => {
      // Arrange
      const inputParam = { username: 'existinguser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(buildUserMock());

      // Act
      await expect(target.apply(inputParam)).rejects.toThrow();

      // Assert
      const createUserSpy = jest.mocked(userRepositoryMock.createUser);
      expect(createUserSpy).not.toHaveBeenCalled();
    });

    it('when apply is called, then the exception message includes the username', async () => {
      // Arrange
      const inputParam = { username: 'existinguser', password: 'securePass1' };
      userRepositoryMock.findByUsername.mockResolvedValue(buildUserMock());

      // Act & Assert
      await expect(target.apply(inputParam)).rejects.toThrow(
        "Username 'existinguser' is already taken.",
      );
    });
  });
});
