import { describe, it, expect } from 'vitest';
import { renderSong } from './songRenderer.js';

describe('songRenderer', () => {
  it('should render a simple song without wrapping', () => {
    const linePairs = [
      {
        chords: [
          { position: 0, chord: 'C' },
          { position: 7, chord: 'Dm7' }
        ],
        lyrics: 'Marcha soldado'
      }
    ];
    
    const result = renderSong(linePairs, 100); // Large maxWidth, no wrapping
    
    // Should render chords in <b> tags on first line, lyrics on second
    // Note: chord line is padded to match lyrics line length
    // Wrapped in span to prevent print breaks
    expect(result).toBe('<span class="chord-lyrics-pair"><b>C</b>      <b>Dm7</b>    \nMarcha soldado</span>');
  });

  it('should render a song with line wrapping applied', () => {
    const linePairs = [
      {
        chords: [
          { position: 0, chord: 'C' },
          { position: 7, chord: 'Dm7' },
          { position: 15, chord: 'F' }
        ],
        lyrics: 'Marcha soldado cabeça'
      }
    ];
    
    const result = renderSong(linePairs, 10); // Small maxWidth, forces wrapping
    
    // Should wrap into 3 lines, each pair in its own span
    expect(result).toBe(
      '<span class="chord-lyrics-pair"><b>C</b>      \n' +
      'Marcha </span>\n' +
      '<span class="chord-lyrics-pair"><b>Dm7</b>     \n' +
      'soldado </span>\n' +
      '<span class="chord-lyrics-pair"><b>F</b>     \n' +
      'cabeça</span>'
    );
  });
});
