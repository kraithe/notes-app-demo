import { TokenBlacklistService } from '../../../services/token-blacklist.service';
import { SignOutTS } from '../sign-out.transaction.script';

describe('SignOutTS', () => {
  let target: SignOutTS;
  let tokenBlacklistServiceMock: jest.Mocked<TokenBlacklistService>;

  beforeEach(() => {
    tokenBlacklistServiceMock = {
      revokeToken: jest.fn(),
      isRevoked: jest.fn(),
    } as unknown as jest.Mocked<TokenBlacklistService>;

    target = new SignOutTS(tokenBlacklistServiceMock);
  });

  describe('given a valid token param', () => {
    it('when apply is called, then it delegates revocation to TokenBlacklistService with the correct jti and expiry', () => {
      // Arrange
      const inputParam = { jti: 'some-jti-uuid', exp: 1_700_000_000 };

      // Act
      target.apply(inputParam);

      // Assert
      expect(tokenBlacklistServiceMock.revokeToken).toHaveBeenNthCalledWith(
        1,
        inputParam.jti,
        inputParam.exp,
      );
    });

    it('when apply is called, then revokeToken is called exactly once', () => {
      // Arrange
      const inputParam = { jti: 'another-jti', exp: 1_700_000_000 };

      // Act
      target.apply(inputParam);

      // Assert
      expect(tokenBlacklistServiceMock.revokeToken).toHaveBeenCalledTimes(1);
    });
  });
});
