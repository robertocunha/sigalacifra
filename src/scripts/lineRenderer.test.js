import { describe, it, expect } from 'vitest';
import { renderLine } from './lineRenderer.js';
import { parseLine } from './lineParser.js';

describe('lineRenderer', () => {
  it('should render a simple line with one chord', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' }
      ],
      lyrics: 'Marcha  '
    };
    
    const result = renderLine(lineData);
    
    // Should produce two lines: chord line + lyrics line
    expect(result).toBe('C       \nMarcha  ');
  });

  it('should render a line with two chords', () => {
    const lineData = {
      chords: [
        { position: 0, chord: 'C' },
        { position: 5, chord: 'Dm7' }
      ],
      lyrics: 'Marcha soldado'
    };
    
    const result = renderLine(lineData);
    
    expect(result).toBe('C    Dm7      \nMarcha soldado');
  });

  it('should maintain data integrity in round-trip (parse → render → parse)', () => {
    const originalChordLine = 'C    Dm7   G7';
    const originalLyricsLine = 'Marcha soldado';
    
    // Parse
    const parsed = parseLine(originalChordLine, originalLyricsLine);
    
    // Render
    const rendered = renderLine(parsed);
    const [renderedChordLine, renderedLyricsLine] = rendered.split('\n');
    
    // Parse again
    const reparsed = parseLine(renderedChordLine, renderedLyricsLine);
    
    // Should be identical to original parse
    expect(reparsed).toEqual(parsed);
  });
});
