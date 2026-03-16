import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username must not be empty.' })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`,
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: `Username must not exceed ${USERNAME_MAX_LENGTH} characters.`,
  })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty.' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`,
  })
  password!: string;
}
