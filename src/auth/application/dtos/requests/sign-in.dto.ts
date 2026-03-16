import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Username must not be empty.' })
  username!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty.' })
  password!: string;
}
