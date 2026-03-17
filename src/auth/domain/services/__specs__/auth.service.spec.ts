import { AuthService } from '../auth.service';
import { RegisterUserTS } from '../../../../users/domain/transaction-scripts/register-user-ts/register-user.transaction.script';
import { SignInTS } from '../../transaction-scripts/sign-in-ts/sign-in.transaction.script';
import { SignOutTS } from '../../transaction-scripts/sign-out-ts/sign-out.transaction.script';

describe('AuthService', () => {
  let target: AuthService;
  let registerUserTSMock: jest.Mocked<RegisterUserTS>;
  let signInTSMock: jest.Mocked<SignInTS>;
  let signOutTSMock: jest.Mocked<SignOutTS>;

  beforeEach(() => {
    registerUserTSMock = {
      apply: jest.fn(),
    } as unknown as jest.Mocked<RegisterUserTS>;
    signInTSMock = { apply: jest.fn() } as unknown as jest.Mocked<SignInTS>;
    signOutTSMock = { apply: jest.fn() } as unknown as jest.Mocked<SignOutTS>;

    target = new AuthService(registerUserTSMock, signInTSMock, signOutTSMock);
  });

  describe('register', () => {
    it('when called, then it delegates to RegisterUserTS with the correct username and password', async () => {
      // Arrange
      const inputUsername = 'newuser';
      const inputPassword = 'securepass';
      registerUserTSMock.apply.mockResolvedValue(undefined);

      // Act
      await target.register(inputUsername, inputPassword);

      // Assert
      const registerApplySpy = jest.mocked(registerUserTSMock.apply);
      expect(registerApplySpy).toHaveBeenNthCalledWith(1, {
        username: inputUsername,
        password: inputPassword,
      });
    });

    it('when called, then RegisterUserTS is called exactly once', async () => {
      // Arrange
      registerUserTSMock.apply.mockResolvedValue(undefined);

      // Act
      await target.register('user', 'pass1234');

      // Assert
      const registerApplySpy = jest.mocked(registerUserTSMock.apply);
      expect(registerApplySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn', () => {
    it('when called, then it delegates to SignInTS with the correct credentials', async () => {
      // Arrange
      const inputUsername = 'existinguser';
      const inputPassword = 'mypassword';
      const expectedResult = { accessToken: 'jwt.token.here' };
      signInTSMock.apply.mockResolvedValue(expectedResult);

      // Act
      await target.signIn(inputUsername, inputPassword);

      // Assert
      const signInApplySpy = jest.mocked(signInTSMock.apply);
      expect(signInApplySpy).toHaveBeenNthCalledWith(1, {
        username: inputUsername,
        password: inputPassword,
      });
    });

    it('when called, then it returns the access token from SignInTS', async () => {
      // Arrange
      const expectedResult = { accessToken: 'signed.jwt.token' };
      signInTSMock.apply.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await target.signIn('user', 'pass1234');

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('signOut', () => {
    it('when called, then it delegates to SignOutTS with the correct jti and exp', () => {
      // Arrange
      const inputJti = 'some-uuid-jti';
      const inputExp = 1_700_000_000;

      // Act
      target.signOut(inputJti, inputExp);

      // Assert
      const signOutApplySpy = jest.mocked(signOutTSMock.apply);
      expect(signOutApplySpy).toHaveBeenNthCalledWith(1, {
        jti: inputJti,
        exp: inputExp,
      });
    });

    it('when called, then SignOutTS is called exactly once', () => {
      // Act
      target.signOut('jti', 1_700_000_000);

      // Assert
      const signOutApplySpy = jest.mocked(signOutTSMock.apply);
      expect(signOutApplySpy).toHaveBeenCalledTimes(1);
    });
  });
});
