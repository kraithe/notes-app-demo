import { ApiProperty } from '@nestjs/swagger';

export class NoteResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  ownedByUserId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  lastModifiedDate!: Date;
}
