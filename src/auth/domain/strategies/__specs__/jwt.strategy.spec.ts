import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../../users/infrastructure/repositories/user.repository';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import { JwtStrategy } from '../jwt.strategy';
import type { JwtPayload } from '../../jwt-payload.type';
import type { User, UserId } from '../../../../users/domain/entities/user.entity';

const buildPayloadMock = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
  sub: 1 as UserId,
  username: 'testuser',
  jti: 'test-jti-uuid',
  exp: Math.floor(Date.now() / 1000) + 7200,
  ...overrides,
});

const buildUserMock = (overrides: Partial<User> = {}): User =>
  ({
    id: 1 as UserId,
    name: 'testuser',
    password: '$2b$10$hashed',
    ...overrides,
  }) as User;

describe('JwtStrategy', () => {
  let target: JwtStrategy;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let tokenBlacklistServiceMock: jest.Mocked<TokenBlacklistService>;
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenBlacklistServiceMock = {
      isRevoked: jest.fn(),
      revokeToken: jest.fn(),
    } as unknown as jest.Mocked<TokenBlacklistService>;

    configServiceMock = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    target = new JwtStrategy(
      configServiceMock,
      userRepositoryMock,
      tokenBlacklistServiceMock,
    );
  });

  describe('given a valid, non-revoked token and an existing user', () => {
    it('when validate is called, then it returns the authenticated user', async () => {
      // Arrange
      const inputPayload = buildPayloadMock();
      const inputUser = buildUserMock();

      tokenBlacklistServiceMock.isRevoked.mockReturnValue(false);
      userRepositoryMock.findById.mockResolvedValue(inputUser);

      // Act
      const actualResult = await target.validate(inputPayload);

      // Assert
      expect(actualResult.userId).toBe(inputPayload.sub);
      expect(actualResult.username).toBe(inputPayload.username);
      expect(actualResult.jti).toBe(inputPayload.jti);
      expect(actualResult.exp).toBe(inputPayload.exp);
    });
  });

  describe('given a revoked token', () => {
    it('when validate is called, then it throws UnauthorizedException with revocation message', async () => {
      // Arrange
      const inputPayload = buildPayloadMock({ jti: 'revoked-jti' });
      tokenBlacklistServiceMock.isRevoked.mockReturnValue(true);

      // Act & Assert
      await expect(target.validate(inputPayload)).rejects.toThrow(
        new UnauthorizedException('Session has been revoked.'),
      );
    });

    it('when validate is called, then findById is never invoked', async () => {
      // Arrange
      const inputPayload = buildPayloadMock({ jti: 'revoked-jti' });
      tokenBlacklistServiceMock.isRevoked.mockReturnValue(true);

      // Act
      await expect(target.validate(inputPayload)).rejects.toThrow();

      // Assert
      expect(userRepositoryMock.findById).not.toHaveBeenCalled();
    });
  });

  describe('given a non-revoked token but user no longer exists', () => {
    it('when validate is called, then it throws UnauthorizedException with existence message', async () => {
      // Arrange
      const inputPayload = buildPayloadMock();
      tokenBlacklistServiceMock.isRevoked.mockReturnValue(false);
      userRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(target.validate(inputPayload)).rejects.toThrow(
        new UnauthorizedException('User no longer exists.'),
      );
    });
  });

  describe('given a valid token', () => {
    it('when validate is called, then isRevoked is checked with the correct jti', async () => {
      // Arrange
      const inputPayload = buildPayloadMock({ jti: 'specific-jti' });
      tokenBlacklistServiceMock.isRevoked.mockReturnValue(false);
      userRepositoryMock.findById.mockResolvedValue(buildUserMock());

      // Act
      await target.validate(inputPayload);

      // Assert
      expect(tokenBlacklistServiceMock.isRevoked).toHaveBeenNthCalledWith(1, 'specific-jti');
    });

    it('when validate is called, then findById is called with the correct user id', async () => {
      // Arrange
      const inputPayload = buildPayloadMock({ sub: 99 as UserId });
      tokenBlacklistServiceMock.isRevoked.mockReturnValue(false);
      userRepositoryMock.findById.mockResolvedValue(buildUserMock({ id: 99 as UserId }));

      // Act
      await target.validate(inputPayload);

      // Assert
      expect(userRepositoryMock.findById).toHaveBeenNthCalledWith(1, 99);
    });
  });
});
