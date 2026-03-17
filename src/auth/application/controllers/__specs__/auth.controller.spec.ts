import { AuthController } from '../auth.controller';
import { AuthService } from '../../../domain/services/auth.service';
import { RegisterUserDto } from '../../../../users/application/dtos/requests/register-user.dto';
import { SignInDto } from '../../dtos/requests/sign-in.dto';
import type { AuthenticatedUser } from '../../../domain/strategies/jwt.strategy';
import type { UserId } from '../../../../users/domain/entities/user.entity';

const buildAuthUserMock = (
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser => ({
  userId: 10 as UserId,
  username: 'testuser',
  jti: 'test-jti-uuid',
  exp: Math.floor(Date.now() / 1000) + 7200,
  ...overrides,
});

const buildRequestMock = (
  user: AuthenticatedUser,
): Request & { user: AuthenticatedUser } =>
  ({ user }) as Request & { user: AuthenticatedUser };

describe('AuthController', () => {
  let target: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(() => {
    authServiceMock = {
      register: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    target = new AuthController(authServiceMock);
  });

  describe('register', () => {
    it('when called, then it delegates to AuthService with the correct username and password', async () => {
      // Arrange
      const inputDto: RegisterUserDto = {
        username: 'newuser',
        password: 'securepass',
      };
      authServiceMock.register.mockResolvedValue(undefined);

      // Act
      await target.register(inputDto);

      // Assert
      const registerSpy = jest.mocked(authServiceMock.register);
      expect(registerSpy).toHaveBeenNthCalledWith(1, 'newuser', 'securepass');
    });

    it('when called, then AuthService.register is called exactly once', async () => {
      // Arrange
      const inputDto: RegisterUserDto = {
        username: 'newuser',
        password: 'securepass',
      };
      authServiceMock.register.mockResolvedValue(undefined);

      // Act
      await target.register(inputDto);

      // Assert
      const registerSpy = jest.mocked(authServiceMock.register);
      expect(registerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn', () => {
    it('when called, then it delegates to AuthService with the correct credentials', async () => {
      // Arrange
      const inputDto: SignInDto = {
        username: 'existinguser',
        password: 'mypassword',
      };
      authServiceMock.signIn.mockResolvedValue({ accessToken: 'token' });

      // Act
      await target.signIn(inputDto);

      // Assert
      const signInSpy = jest.mocked(authServiceMock.signIn);
      expect(signInSpy).toHaveBeenNthCalledWith(
        1,
        'existinguser',
        'mypassword',
      );
    });

    it('when called, then it returns the access token from AuthService', async () => {
      // Arrange
      const inputDto: SignInDto = { username: 'user', password: 'pass1234' };
      const expectedResult = { accessToken: 'signed.jwt.token' };
      authServiceMock.signIn.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await target.signIn(inputDto);

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('signOut', () => {
    it('when called, then it delegates to AuthService with the jti and exp from the request user', () => {
      // Arrange
      const inputUser = buildAuthUserMock({
        jti: 'specific-jti',
        exp: 1_700_000_000,
      });
      const inputReq = buildRequestMock(inputUser);

      // Act
      target.signOut(inputReq);

      // Assert
      const signOutSpy = jest.mocked(authServiceMock.signOut);
      expect(signOutSpy).toHaveBeenNthCalledWith(
        1,
        'specific-jti',
        1_700_000_000,
      );
    });

    it('when called, then AuthService.signOut is called exactly once', () => {
      // Arrange
      const inputReq = buildRequestMock(buildAuthUserMock());

      // Act
      target.signOut(inputReq);

      // Assert
      const signOutSpy = jest.mocked(authServiceMock.signOut);
      expect(signOutSpy).toHaveBeenCalledTimes(1);
    });
  });
});
