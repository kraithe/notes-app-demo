import { ApiProperty } from '@nestjs/swagger';

export class RelatedNoteResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;
}
