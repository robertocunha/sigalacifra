import { describe, it, expect } from 'vitest';
import { transposeChord } from './transpose.js';

describe('transposeChord', () => {
  describe('Basic major chords', () => {
    it('should transpose C up by 1 semitone to C#', () => {
      expect(transposeChord('C', 1)).toBe('C#');
    });

    it('should transpose C up by 2 semitones to D', () => {
      expect(transposeChord('C', 2)).toBe('D');
    });

    it('should transpose G up by 2 semitones to A', () => {
      expect(transposeChord('G', 2)).toBe('A');
    });

    it('should transpose C down by 1 semitone to B', () => {
      expect(transposeChord('C', -1)).toBe('B');
    });

    it('should transpose D down by 2 semitones to C', () => {
      expect(transposeChord('D', -2)).toBe('C');
    });
  });

  describe('Chords with flats (downward transposition)', () => {
    it('should use flats when transposing down', () => {
      expect(transposeChord('C', -1)).toBe('B'); // B, not A#
      expect(transposeChord('D', -1)).toBe('Db'); // Db, not C#
      expect(transposeChord('A', -1)).toBe('Ab'); // Ab, not G#
      expect(transposeChord('G', -1)).toBe('Gb'); // Gb, not F#
      expect(transposeChord('E', -1)).toBe('Eb'); // Eb, not D#
    });

    it('should handle flat notes correctly', () => {
      expect(transposeChord('Bb', 1)).toBe('B');
      expect(transposeChord('Bb', 2)).toBe('C');
      expect(transposeChord('Eb', 2)).toBe('F');
      expect(transposeChord('Ab', 3)).toBe('B');
    });
  });

  describe('Chords with sharps (upward transposition)', () => {
    it('should use sharps when transposing up', () => {
      expect(transposeChord('C', 1)).toBe('C#'); // C#, not Db
      expect(transposeChord('D', 1)).toBe('D#'); // D#, not Eb
      expect(transposeChord('F', 1)).toBe('F#'); // F#, not Gb
    });

    it('should handle sharp notes correctly', () => {
      expect(transposeChord('F#', 1)).toBe('G');
      expect(transposeChord('C#', 2)).toBe('D#');
      expect(transposeChord('G#', 3)).toBe('B');
    });
  });

  describe('Minor chords', () => {
    it('should preserve the "m" suffix', () => {
      expect(transposeChord('Am', 2)).toBe('Bm');
      expect(transposeChord('Dm', 2)).toBe('Em');
      expect(transposeChord('Em', -2)).toBe('Dm');
    });

    it('should work with sharps and flats', () => {
      expect(transposeChord('F#m', 2)).toBe('G#m');
      expect(transposeChord('Bbm', 1)).toBe('Bm');
      expect(transposeChord('Ebm', -1)).toBe('Dm');
    });
  });

  describe('Chords with extensions', () => {
    it('should preserve 7th chords', () => {
      expect(transposeChord('G7', 2)).toBe('A7');
      expect(transposeChord('C7', -1)).toBe('B7');
    });

    it('should preserve major 7th notation (7M and M7)', () => {
      expect(transposeChord('D7M', 2)).toBe('E7M');
      expect(transposeChord('CM7', 2)).toBe('DM7');
      expect(transposeChord('Gmaj7', 2)).toBe('Amaj7');
    });

    it('should preserve complex extensions', () => {
      expect(transposeChord('G7M(9)', 2)).toBe('A7M(9)');
      expect(transposeChord('A7(9)', -2)).toBe('G7(9)');
      expect(transposeChord('Csus4', 1)).toBe('C#sus4');
      expect(transposeChord('Dsus2', -1)).toBe('Dbsus2');
    });

    it('should preserve dim, aug, and other qualities', () => {
      expect(transposeChord('Cdim', 2)).toBe('Ddim');
      expect(transposeChord('Caug', 2)).toBe('Daug');
      expect(transposeChord('C7+', 2)).toBe('D7+');
    });
  });

  describe('Slash chords (bass notes)', () => {
    it('should transpose both root and bass note', () => {
      expect(transposeChord('G/B', 2)).toBe('A/C#');
      expect(transposeChord('D/F#', 2)).toBe('E/G#');
      expect(transposeChord('C/G', 2)).toBe('D/A');
    });

    it('should use flats in bass when transposing down', () => {
      expect(transposeChord('D/F#', -2)).toBe('C/E'); // F# -2 = E (correto)
      expect(transposeChord('A/C#', -2)).toBe('G/B'); // C# -2 = B (correto)
      expect(transposeChord('G/B', -1)).toBe('Gb/Bb'); // G -1 = Gb, B -1 = Bb
    });

    it('should handle complex chords with bass notes', () => {
      expect(transposeChord('Am7/G', 2)).toBe('Bm7/A');
      expect(transposeChord('G7M/B', 2)).toBe('A7M/C#');
    });
  });

  describe('Full circle transposition', () => {
    it('should return to original after 12 semitones up', () => {
      expect(transposeChord('C', 12)).toBe('C');
      expect(transposeChord('G7M', 12)).toBe('G7M');
      expect(transposeChord('Am/G', 12)).toBe('Am/G');
    });

    it('should return to original after 12 semitones down', () => {
      expect(transposeChord('C', -12)).toBe('C');
      expect(transposeChord('D7M', -12)).toBe('D7M');
      expect(transposeChord('G/B', -12)).toBe('G/B');
    });

    it('should handle multiple octave transpositions', () => {
      expect(transposeChord('C', 24)).toBe('C');
      expect(transposeChord('C', -24)).toBe('C');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero transposition', () => {
      expect(transposeChord('C', 0)).toBe('C');
      expect(transposeChord('G7M', 0)).toBe('G7M');
      expect(transposeChord('Am/G', 0)).toBe('Am/G');
    });

    it('should handle enharmonic equivalents', () => {
      // When transposing Bb down, it should stay in flats
      expect(transposeChord('Bb', -2)).toBe('Ab');
      
      // When transposing C# up, it should stay in sharps
      expect(transposeChord('C#', 2)).toBe('D#');
    });
  });

  describe('Real-world examples (common progressions)', () => {
    it('should transpose I-IV-V progression in C', () => {
      // C-F-G progression transposed up 2 semitones to D
      expect(transposeChord('C', 2)).toBe('D');
      expect(transposeChord('F', 2)).toBe('G');
      expect(transposeChord('G', 2)).toBe('A');
    });

    it('should transpose ii-V-I in G (Am7-D7-G7M)', () => {
      // Transposed up 2 semitones to A
      expect(transposeChord('Am7', 2)).toBe('Bm7');
      expect(transposeChord('D7', 2)).toBe('E7');
      expect(transposeChord('G7M', 2)).toBe('A7M');
    });

    it('should transpose bossa nova progression with bass notes', () => {
      // Common bossa pattern: G7M - G7M/F# - Em7
      expect(transposeChord('G7M', -2)).toBe('F7M');
      expect(transposeChord('G7M/F#', -2)).toBe('F7M/E');
      expect(transposeChord('Em7', -2)).toBe('Dm7');
    });
  });
});
