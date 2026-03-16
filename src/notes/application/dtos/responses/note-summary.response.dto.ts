import { ApiProperty } from '@nestjs/swagger';

const PREVIEW_LENGTH = 30;
const ELLIPSIS = '…';

export class NoteSummaryResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  ownedByUserId!: number;

  @ApiProperty()
  titlePreview!: string;

  @ApiProperty()
  contentPreview!: string;

  @ApiProperty()
  lastModifiedDate!: Date;

  static truncate(value: string): string {
    return value.length > PREVIEW_LENGTH
      ? value.slice(0, PREVIEW_LENGTH) + ELLIPSIS
      : value;
  }
}
