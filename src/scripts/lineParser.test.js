    import { describe, it, expect } from 'vitest';
import { parseLine } from './lineParser.js';

describe('lineParser', () => {
  it('should parse a simple line with one chord', () => {
    const chordLine = 'C       ';
    const lyricsLine = 'Marcha  ';
    
    const result = parseLine(chordLine, lyricsLine);
    
    expect(result).toEqual({
      chords: [
        { position: 0, chord: 'C' }
      ],
      lyrics: 'Marcha  '
    });
  });

  it('should parse a line with two chords', () => {
    const chordLine = 'C    Dm7';
    const lyricsLine = 'Marcha so';
    
    const result = parseLine(chordLine, lyricsLine);
    
    expect(result).toEqual({
      chords: [
        { position: 0, chord: 'C' },
        { position: 5, chord: 'Dm7' }
      ],
      lyrics: 'Marcha so'
    });
  });

  it('should parse chords that start with spaces', () => {
    const chordLine = '    C   Dm7';
    const lyricsLine = '    Era uma ';
    
    const result = parseLine(chordLine, lyricsLine);
    
    expect(result).toEqual({
      chords: [
        { position: 4, chord: 'C' },
        { position: 8, chord: 'Dm7' }
      ],
      lyrics: '    Era uma '
    });
  });
});
