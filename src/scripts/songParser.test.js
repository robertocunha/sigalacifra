import { describe, it, expect } from 'vitest';
import { parseSong } from './songParser.js';

describe('songParser', () => {
  it('should parse a simple song with one line pair', () => {
    const text = `C      Dm7
Marcha soldado`;
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' },
          { position: 7, chord: 'Dm7' }
        ],
        lyrics: 'Marcha soldado'
      }
    ]);
  });

  it('should parse a song with multiple line pairs and empty lines', () => {
    const text = `C      Dm7     F
Marcha soldado cabeça

G    Am
Ninguém podia`;
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' },
          { position: 7, chord: 'Dm7' },
          { position: 15, chord: 'F' }
        ],
        lyrics: 'Marcha soldado cabeça'
      },
      { type: 'empty' },
      {
        chords: [
          { position: 0, chord: 'G' },
          { position: 5, chord: 'Am' }
        ],
        lyrics: 'Ninguém podia'
      }
    ]);
  });

  it('should handle annotation lines (text without chords)', () => {
    const text = `C      Dm7
Marcha soldado

(solo piano)

G    Am
Ninguém podia`;
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'C' },
          { position: 7, chord: 'Dm7' }
        ],
        lyrics: 'Marcha soldado'
      },
      { type: 'empty' },
      { type: 'annotation', text: '(solo piano)' },
      { type: 'empty' },
      {
        chords: [
          { position: 0, chord: 'G' },
          { position: 5, chord: 'Am' }
        ],
        lyrics: 'Ninguém podia'
      }
    ]);
  });

  it('should handle consecutive chord lines (chords without lyrics)', () => {
    const text = `Em7  F#m7  B7  Em7
Fm7  Gm7   C7  Fm7
Em7  F#m7  B7  Em7`;
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      {
        chords: [
          { position: 0, chord: 'Em7' },
          { position: 5, chord: 'F#m7' },
          { position: 11, chord: 'B7' },
          { position: 15, chord: 'Em7' }
        ],
        lyrics: ''
      },
      {
        chords: [
          { position: 0, chord: 'Fm7' },
          { position: 5, chord: 'Gm7' },
          { position: 11, chord: 'C7' },
          { position: 15, chord: 'Fm7' }
        ],
        lyrics: ''
      },
      {
        chords: [
          { position: 0, chord: 'Em7' },
          { position: 5, chord: 'F#m7' },
          { position: 11, chord: 'B7' },
          { position: 15, chord: 'Em7' }
        ],
        lyrics: ''
      }
    ]);
  });

  // Edge cases
  it('should handle text with emojis and special characters', () => {
    const text = `C
🎵 ♪ ♫ ♬ 🎶

G
Música com símbolos ©®™`;
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      {
        chords: [{ position: 0, chord: 'C' }],
        lyrics: '🎵 ♪ ♫ ♬ 🎶'
      },
      { type: 'empty' },
      {
        chords: [{ position: 0, chord: 'G' }],
        lyrics: 'Música com símbolos ©®™'
      }
    ]);
  });

  it('should handle empty string', () => {
    const text = '';
    
    const result = parseSong(text);
    
    // Empty string results in one empty line
    expect(result).toEqual([{ type: 'empty' }]);
  });

  it('should handle only empty lines', () => {
    const text = '\n\n\n';
    
    const result = parseSong(text);
    
    expect(result).toEqual([
      { type: 'empty' },
      { type: 'empty' },
      { type: 'empty' },
      { type: 'empty' }
    ]);
  });
});
