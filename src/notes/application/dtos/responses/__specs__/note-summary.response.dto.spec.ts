import { NoteSummaryResponseDto } from '../note-summary.response.dto';

describe('NoteSummaryResponseDto.truncate', () => {
  describe('given a string shorter than 30 characters', () => {
    it('when truncate is called, then it returns the string unchanged', () => {
      // Arrange
      const inputValue = 'Short string';

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect(actualResult).toBe('Short string');
    });
  });

  describe('given a string exactly 30 characters long', () => {
    it('when truncate is called, then it returns the string unchanged', () => {
      // Arrange
      const inputValue = 'A'.repeat(30);

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect(actualResult).toBe('A'.repeat(30));
      expect(actualResult).not.toContain('…');
    });
  });

  describe('given a string longer than 30 characters', () => {
    it('when truncate is called, then it returns the first 30 characters followed by an ellipsis', () => {
      // Arrange
      const inputValue = 'A'.repeat(31);

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect(actualResult).toBe('A'.repeat(30) + '…');
    });

    it('when truncate is called, then the result is exactly 31 characters (30 + ellipsis)', () => {
      // Arrange
      const inputValue = 'B'.repeat(100);

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect([...actualResult].length).toBe(31);
    });

    it('when truncate is called, then only the first 30 characters of content are preserved', () => {
      // Arrange
      const inputValue =
        'Hello World, this is a long string that goes well beyond thirty chars';

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect(actualResult.startsWith('Hello World, this is a long st')).toBe(
        true,
      );
    });
  });

  describe('given an empty string', () => {
    it('when truncate is called, then it returns an empty string', () => {
      // Arrange
      const inputValue = '';

      // Act
      const actualResult = NoteSummaryResponseDto.truncate(inputValue);

      // Assert
      expect(actualResult).toBe('');
    });
  });
});
