import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty.' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters.' })
  title!: string;

  @ApiProperty({ maxLength: 200000 })
  @IsString()
  @IsNotEmpty({ message: 'Content must not be empty.' })
  @MaxLength(200000, { message: 'Content must not exceed 200,000 characters.' })
  content!: string;
}
