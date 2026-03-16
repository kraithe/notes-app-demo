import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../../../users/infrastructure/repositories/user.repository';
import { InvalidCredentialsException } from '../../../exceptions/invalid-credentials.exception';
import { SignInTS } from '../sign-in.transaction.script';
import type { User, UserId } from '../../../../../users/domain/entities/user.entity';

jest.mock('bcrypt');

const buildUserMock = (overrides: Partial<User> = {}): User =>
  ({
    id: 1 as UserId,
    name: 'testuser',
    password: '$2b$10$hashedpassword',
    ...overrides,
  }) as User;

describe('SignInTS', () => {
  let target: SignInTS;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepositoryMock = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    jwtServiceMock = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    target = new SignInTS(userRepositoryMock, jwtServiceMock);
  });

  describe('given valid credentials', () => {
    it('when apply is called, then it returns an access token', async () => {
      // Arrange
      const inputUser = buildUserMock();
      const inputParam = { username: 'testuser', password: 'correct-password' };
      const expectedToken = 'signed.jwt.token';

      userRepositoryMock.findByUsername.mockResolvedValue(inputUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue(expectedToken);

      // Act
      const actualResult = await target.apply(inputParam);

      // Assert
      expect(actualResult.accessToken).toBe(expectedToken);
    });

    it('when apply is called, then the JWT payload includes sub, username, and jti', async () => {
      // Arrange
      const inputUser = buildUserMock({ id: 42 as UserId, name: 'testuser' });
      const inputParam = { username: 'testuser', password: 'correct-password' };

      userRepositoryMock.findByUsername.mockResolvedValue(inputUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue('token');

      // Act
      await target.apply(inputParam);
      const signSpy = jwtServiceMock.sign.mock.calls[0][0] as Record<string, unknown>;

      // Assert
      expect(signSpy.sub).toBe(42);
      expect(signSpy.username).toBe('testuser');
      expect(typeof signSpy.jti).toBe('string');
      expect((signSpy.jti as string).length).toBeGreaterThan(0);
    });
  });

  describe('given a username that does not exist', () => {
    it('when apply is called, then it throws InvalidCredentialsException', async () => {
      // Arrange
      const inputParam = { username: 'unknown', password: 'anypassword' };
      userRepositoryMock.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(target.apply(inputParam)).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('given a correct username but wrong password', () => {
    it('when apply is called, then it throws InvalidCredentialsException', async () => {
      // Arrange
      const inputUser = buildUserMock();
      const inputParam = { username: 'testuser', password: 'wrong-password' };

      userRepositoryMock.findByUsername.mockResolvedValue(inputUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(target.apply(inputParam)).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
