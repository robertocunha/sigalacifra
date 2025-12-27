import { describe, it, expect } from 'vitest';
import { parseSong } from './songParser.js';
import { renderSong } from './songRenderer.js';

describe('Bug Fixes - Line Wrapping', () => {
  
  describe('Fix #1: Annotations (text without chords) should wrap', () => {
    it('should wrap long annotation text', () => {
      const input = `Mil ideias e uma história de amor`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 20); // maxWidth = 20
      
      const lines = rendered.split('\n');
      
      // Should be wrapped into multiple lines
      expect(lines.length).toBeGreaterThan(1);
      
      // Each line should not exceed maxWidth (with some tolerance for words)
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(25); // Some tolerance for long words
      });
    });
    
    it('should preserve short annotations without wrapping', () => {
      const input = `Intro`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 20);
      
      expect(rendered).toBe('Intro');
    });
    
    it('should wrap real-world annotation example', () => {
      const input = `Aqui entram os tamborins, logo depois dos vocais`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 30);
      
      const lines = rendered.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });
  
  describe('Fix #2: Chord-only lines should wrap', () => {
    it('should wrap chord-only line that exceeds maxWidth', () => {
      const input = `G7M  D7M(2)  G7M  D7M(2)`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 15); // maxWidth = 15
      
      const lines = rendered.split('\n').filter(l => l.trim() !== '');
      
      // Should be broken into multiple lines
      expect(lines.length).toBeGreaterThan(1);
      
      // Each line should contain chords
      lines.forEach(line => {
        expect(line).toContain('<b>');
      });
    });
    
    it('should handle intro with multiple chord-only lines', () => {
      const input = `[intro] Dm7  G7(13)  Cmaj7  A7
Fmaj7  G7  C6`;
      
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 20);
      
      const lines = rendered.split('\n').filter(l => l.trim() !== '');
      
      // Both lines should be wrapped if they exceed maxWidth
      expect(lines.length).toBeGreaterThan(2);
      
      // Check that [intro] is preserved
      expect(rendered).toContain('[intro]');
    });
    
    it('should preserve chord-only line that fits within maxWidth', () => {
      const input = `Am  F  C`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 30);
      
      const lines = rendered.split('\n').filter(l => l.trim() !== '');
      
      // Should remain as single line (fits in 30 chars)
      expect(lines.length).toBe(1);
    });
  });
  
  describe('Integration: Mixed content', () => {
    it('should handle song with annotations, chord-only, and normal lines', () => {
      const input = `Aqui entram os tamborins, logo depois dos vocais

G7M  D7M(2)  Em7  A7(9)  Bm7  E7(b9)

                D7M(2)         Em7(9)
Do que a gente junto, nós dois

Mil ideias e uma história de amor
       D7M(2)          Em7(9)
E o assunto é nós dois`;

      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 25);
      
      const lines = rendered.split('\n');
      
      // Should have multiple lines (wrapping applied)
      expect(lines.length).toBeGreaterThan(5);
      
      // Should contain chords
      expect(rendered).toContain('<b>');
      
      // Should contain annotations
      expect(rendered).toContain('tamborins');
      expect(rendered).toContain('Mil ideias');
    });
  });
});
