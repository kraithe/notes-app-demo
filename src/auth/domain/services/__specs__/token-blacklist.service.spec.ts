import { TokenBlacklistService } from '../token-blacklist.service';

describe('TokenBlacklistService', () => {
  let target: TokenBlacklistService;

  beforeEach(() => {
    jest.useFakeTimers();
    target = new TokenBlacklistService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('given a token that has not been revoked', () => {
    it('when isRevoked is called, then it returns false', () => {
      // Arrange
      const jti = 'test-jti-123';

      // Act
      const actualResult = target.isRevoked(jti);

      // Assert
      expect(actualResult).toBe(false);
    });
  });

  describe('given a future expiry time', () => {
    it('when revokeToken is called, then isRevoked returns true', () => {
      // Arrange
      const jti = 'test-jti-abc';
      const futureExpiry = Math.floor(Date.now() / 1000) + 7200;

      // Act
      target.revokeToken(jti, futureExpiry);

      // Assert
      expect(target.isRevoked(jti)).toBe(true);
    });

    it('when the TTL elapses, then isRevoked returns false', () => {
      // Arrange
      const jti = 'test-jti-ttl';
      const futureExpiry = Math.floor(Date.now() / 1000) + 10;

      // Act
      target.revokeToken(jti, futureExpiry);
      jest.advanceTimersByTime(11_000);

      // Assert
      expect(target.isRevoked(jti)).toBe(false);
    });
  });

  describe('given an already-expired expiry time', () => {
    it('when revokeToken is called, then the token is not added to the blacklist', () => {
      // Arrange
      const jti = 'test-jti-expired';
      const pastExpiry = Math.floor(Date.now() / 1000) - 60;

      // Act
      target.revokeToken(jti, pastExpiry);

      // Assert
      expect(target.isRevoked(jti)).toBe(false);
    });
  });

  describe('given two distinct tokens are revoked', () => {
    it('when isRevoked is called for each, then both return true independently', () => {
      // Arrange
      const jtiOne = 'token-one';
      const jtiTwo = 'token-two';
      const futureExpiry = Math.floor(Date.now() / 1000) + 3600;

      // Act
      target.revokeToken(jtiOne, futureExpiry);
      target.revokeToken(jtiTwo, futureExpiry);

      // Assert
      expect(target.isRevoked(jtiOne)).toBe(true);
      expect(target.isRevoked(jtiTwo)).toBe(true);
    });

    it('when only one token TTL elapses, then only that token is no longer revoked', () => {
      // Arrange
      const shortJti = 'short-lived';
      const longJti = 'long-lived';
      const shortExpiry = Math.floor(Date.now() / 1000) + 5;
      const longExpiry = Math.floor(Date.now() / 1000) + 3600;

      // Act
      target.revokeToken(shortJti, shortExpiry);
      target.revokeToken(longJti, longExpiry);
      jest.advanceTimersByTime(6_000);

      // Assert
      expect(target.isRevoked(shortJti)).toBe(false);
      expect(target.isRevoked(longJti)).toBe(true);
    });
  });
});
