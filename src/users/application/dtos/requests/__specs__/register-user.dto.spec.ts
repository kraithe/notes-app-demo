import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterUserDto } from '../register-user.dto';

const buildValidDto = (overrides: Partial<RegisterUserDto> = {}): RegisterUserDto =>
  plainToInstance(RegisterUserDto, {
    username: 'validuser',
    password: 'validpass',
    ...overrides,
  });

const getMessagesFor = async (dto: RegisterUserDto): Promise<string[]> => {
  const errors = await validate(dto);
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
};

describe('RegisterUserDto', () => {
  describe('given a fully valid payload', () => {
    it('when validated, then no errors are returned', async () => {
      // Arrange
      const inputDto = buildValidDto();

      // Act
      const actualErrors = await validate(inputDto);

      // Assert
      expect(actualErrors).toHaveLength(0);
    });
  });

  describe('username validation', () => {
    describe('given an empty username', () => {
      it('when validated, then it returns an empty username error', async () => {
        // Arrange
        const inputDto = buildValidDto({ username: '' });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Username must not be empty.');
      });
    });

    describe('given a username that is too short', () => {
      it('when validated, then it returns a min-length error', async () => {
        // Arrange
        const inputDto = buildValidDto({ username: 'a' });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Username must be at least 2 characters long.');
      });
    });

    describe('given a username that is exactly at the minimum length', () => {
      it('when validated, then no errors are returned', async () => {
        // Arrange
        const inputDto = buildValidDto({ username: 'ab' });

        // Act
        const actualErrors = await validate(inputDto);

        // Assert
        expect(actualErrors).toHaveLength(0);
      });
    });

    describe('given a username that exceeds the maximum length', () => {
      it('when validated, then it returns a max-length error', async () => {
        // Arrange
        const inputDto = buildValidDto({ username: 'a'.repeat(21) });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Username must not exceed 20 characters.');
      });
    });

    describe('given a username that is exactly at the maximum length', () => {
      it('when validated, then no errors are returned', async () => {
        // Arrange
        const inputDto = buildValidDto({ username: 'a'.repeat(20) });

        // Act
        const actualErrors = await validate(inputDto);

        // Assert
        expect(actualErrors).toHaveLength(0);
      });
    });
  });

  describe('password validation', () => {
    describe('given an empty password', () => {
      it('when validated, then it returns an empty password error', async () => {
        // Arrange
        const inputDto = buildValidDto({ password: '' });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Password must not be empty.');
      });
    });

    describe('given a password that is too short', () => {
      it('when validated, then it returns a min-length error', async () => {
        // Arrange
        const inputDto = buildValidDto({ password: 'short' });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Password must be at least 8 characters long.');
      });
    });

    describe('given a password that is exactly at the minimum length', () => {
      it('when validated, then no errors are returned', async () => {
        // Arrange
        const inputDto = buildValidDto({ password: 'exactly8' });

        // Act
        const actualErrors = await validate(inputDto);

        // Assert
        expect(actualErrors).toHaveLength(0);
      });
    });

    describe('given a password that exceeds the maximum length', () => {
      it('when validated, then it returns a max-length error', async () => {
        // Arrange
        const inputDto = buildValidDto({ password: 'a'.repeat(21) });

        // Act
        const actualMessages = await getMessagesFor(inputDto);

        // Assert
        expect(actualMessages).toContain('Password must not exceed 20 characters.');
      });
    });

    describe('given a password that is exactly at the maximum length', () => {
      it('when validated, then no errors are returned', async () => {
        // Arrange
        const inputDto = buildValidDto({ password: 'a'.repeat(20) });

        // Act
        const actualErrors = await validate(inputDto);

        // Assert
        expect(actualErrors).toHaveLength(0);
      });
    });
  });
});
