import { ApiProperty } from '@nestjs/swagger';

export class SuggestedWebContentResponseDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  reason!: string | null;
}
