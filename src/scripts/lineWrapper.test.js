import { describe, it, expect } from 'vitest';
import { wrapLine } from './lineWrapper.js';

describe('lineWrapper', () => {
  it('should not wrap a line that fits within max width', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' }
      ],
      lyrics: 'Marcha'
    };
    const maxWidth = 16;
    
    const result = wrapLine(lineData, maxWidth);
    
    // Should return array with single line (no wrapping needed)
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' }
        ],
        lyrics: 'Marcha'
      }
    ]);
  });

  it('should wrap a line at word boundary when exceeds max width', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' },
        { position: 8, chord: 'Dm7' }
      ],
      lyrics: 'Marcha soldado'
    };
    const maxWidth = 7; // Only fits "Marcha "
    
    const result = wrapLine(lineData, maxWidth);
    
    // Should split into two lines at the space after "Marcha" (position 7)
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' }
        ],
        lyrics: 'Marcha '
      },
      {
        chords: [
          { position: 1, chord: 'Dm7' } // Was at 8, break at 7, so 8-7=1
        ],
        lyrics: 'soldado'
      }
    ]);
  });

  it('should not split a chord in the middle when wrapping', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' },
        { position: 6, chord: 'Am' },
        { position: 10, chord: 'Dm7' }
      ],
      lyrics: 'Marcha soldado'
    };
    const maxWidth = 10; // Enough to fit " soldado" (8 chars)
    
    const result = wrapLine(lineData, maxWidth);
    
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' }
        ],
        lyrics: 'Marcha'
      },
      {
        chords: [
          { position: 0, chord: 'Am' },
          { position: 4, chord: 'Dm7' }
        ],
        lyrics: ' soldado'
      }
    ]);
  });

  it('should recursively wrap long lines into multiple parts', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' },
        { position: 7, chord: 'Dm7' },
        { position: 15, chord: 'F' }
      ],
      lyrics: 'Marcha soldado cabeça'
    };
    const maxWidth = 10;
    
    const result = wrapLine(lineData, maxWidth);
    
    // Total length is 22 chars, should break into 3 parts:
    // "Marcha " (7 chars) - has C
    // "soldado " (8 chars) - has Dm7 
    // "cabeça" (6 chars) - has F
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' }
        ],
        lyrics: 'Marcha '
      },
      {
        chords: [
          { position: 0, chord: 'Dm7' }
        ],
        lyrics: 'soldado '
      },
      {
        chords: [
          { position: 0, chord: 'F' }
        ],
        lyrics: 'cabeça'
      }
    ]);
  });

  // Edge cases
  it('should handle line with no spaces (cannot wrap gracefully)', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'Am' },
        { position: 30, chord: 'Dm' }
      ],
      lyrics: 'AmDmGCFBbEbAbDbGbCbFbBbmEbmAbmDbmGbmCbmFbm'
    };
    const maxWidth = 20;
    
    const result = wrapLine(lineData, maxWidth);
    
    // Should return as-is since no space found to break
    expect(result).toHaveLength(1);
    expect(result[0].lyrics).toBe('AmDmGCFBbEbAbDbGbCbFbBbmEbmAbmDbmGbmCbmFbm');
  });

  it('should handle empty lyrics with multiple chords', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'Am' },
        { position: 4, chord: 'Dm' },
        { position: 8, chord: 'G' },
        { position: 11, chord: 'C' }
      ],
      lyrics: ''
    };
    const maxWidth = 10;
    
    const result = wrapLine(lineData, maxWidth);
    
    // Should wrap chord-only line into multiple lines
    expect(result.length).toBeGreaterThan(1);
    result.forEach(line => {
      expect(line.lyrics).toBe('');
      expect(line.chords.length).toBeGreaterThan(0);
    });
  });

  it('should handle lyrics with only whitespace', () => {
    const lineData = {
      chords: [],
      lyrics: '                                        '
    };
    const maxWidth = 20;
    
    const result = wrapLine(lineData, maxWidth);
    
    // Long whitespace may wrap into multiple parts
    expect(result.length).toBeGreaterThanOrEqual(1);
    result.forEach(line => {
      expect(line.chords).toEqual([]);
    });
  });
});
