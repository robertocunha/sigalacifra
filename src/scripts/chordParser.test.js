import { describe, it, expect } from 'vitest';
import { isChord, isChordLine, parseChordSheet } from './chordParser.js';

describe('isChord', () => {
  it('should recognize basic major chords', () => {
    expect(isChord('C')).toBe(true);
    expect(isChord('G')).toBe(true);
    expect(isChord('A')).toBe(true);
  });

  it('should recognize minor chords', () => {
    expect(isChord('Am')).toBe(true);
    expect(isChord('Dm')).toBe(true);
    expect(isChord('F#m')).toBe(true);
  });

  it('should recognize chords with extensions', () => {
    expect(isChord('G7')).toBe(true);
    expect(isChord('D7M')).toBe(true);
    expect(isChord('CM7')).toBe(true);
    expect(isChord('Cmaj7')).toBe(true);
    expect(isChord('Am7')).toBe(true);
  });

  it('should recognize chords with sharps and flats', () => {
    expect(isChord('F#')).toBe(true);
    expect(isChord('Bb')).toBe(true);
    expect(isChord('C#m')).toBe(true);
    expect(isChord('Eb7M')).toBe(true);
  });

  it('should recognize chords with bass notes', () => {
    expect(isChord('G/B')).toBe(true);
    expect(isChord('D/F#')).toBe(true);
    expect(isChord('Am/G')).toBe(true);
  });

  it('should recognize complex chords', () => {
    expect(isChord('G7M(9)')).toBe(true);
    expect(isChord('A7(9)')).toBe(true);
    expect(isChord('Csus4')).toBe(true);
    expect(isChord('Dsus2')).toBe(true);
    expect(isChord('Cdim')).toBe(true);
    expect(isChord('Caug')).toBe(true);
    expect(isChord('C7+')).toBe(true);
    expect(isChord('G°')).toBe(true);
    expect(isChord('D#7/9M')).toBe(true);
    expect(isChord('D#7/9+')).toBe(true);
    expect(isChord('D#7/9-')).toBe(true);
  });

  it('should NOT recognize regular words', () => {
    expect(isChord('Hello')).toBe(false);
    expect(isChord('Brasil')).toBe(false);
    expect(isChord('amor')).toBe(false);
    expect(isChord('e')).toBe(false);
    expect(isChord('123')).toBe(false);
  });

  it('should NOT recognize empty strings', () => {
    expect(isChord('')).toBe(false);
    expect(isChord('   ')).toBe(false);
  });
});

describe('isChordLine', () => {
  it('should recognize lines with only chords', () => {
    expect(isChordLine('C  Am  F  G')).toBe(true);
    expect(isChordLine('G7M  D/F#  Em  A7')).toBe(true);
  });

  it('should recognize lines with mostly chords (>50%)', () => {
    expect(isChordLine('C Am e F G')).toBe(true); // 4/5 = 80%
  });

  it('should NOT recognize lines with mostly lyrics', () => {
    expect(isChordLine('Eu vou cantar essa música')).toBe(false);
    expect(isChordLine('Hello world from Brasil')).toBe(false);
  });

  it('should handle edge case: exactly 50% chords', () => {
    // 1 chord + 1 word = 50%, changed to >= 50% (Dec 2025 fix)
    expect(isChordLine('C amor')).toBe(true);
  });

  it('should NOT recognize empty lines', () => {
    expect(isChordLine('')).toBe(false);
    expect(isChordLine('   ')).toBe(false);
  });

  it('should NOT recognize lyrics with words that look like chords (E, Em, A)', () => {
    expect(isChordLine('E agora, José?')).toBe(false); // "E" = conjunção, não acorde
    expect(isChordLine('Em cima daquela serra')).toBe(false); // "Em" = preposição, não acorde
    expect(isChordLine('A minha cidade')).toBe(false); // "A" = artigo, não acorde
    expect(isChordLine('E eu vou cantar')).toBe(false);
  });

  it('should recognize structural lines with few chords (Intro, Refrão, etc.)', () => {
    // Estas linhas TÊM acordes de verdade, então devem ser parseadas
    expect(isChordLine('Intro: Am7 D7')).toBe(true); // 2 acordes / 3 palavras = 66%
    expect(isChordLine('Refrão: G C D')).toBe(true); // 3 acordes / 4 palavras = 75%
    
    // Exatamente 50% agora parseia (>= 50% após fix de Dec 2025)
    expect(isChordLine('Solo: Em')).toBe(true); // 1 acorde / 2 palavras = 50%
  });

  it('should NOT parse chords embedded in descriptive text', () => {
    // Acordes no meio de frases descritivas não devem ser parseados
    // Isso evita falsos positivos e é o comportamento desejado
    const line = 'Entra a percussão e depois o baixo no breque do D7 entra o vocal';
    expect(isChordLine(line)).toBe(false); // 1 acorde / 13 palavras = ~7%
  });
});

describe('parseChordSheet', () => {
  it('should wrap chords in <b> tags', () => {
    const input = 'C  Am  F  G';
    const expected = '<b>C</b>  <b>Am</b>  <b>F</b>  <b>G</b>';
    expect(parseChordSheet(input)).toBe(expected);
  });

  it('should preserve lyric lines unchanged', () => {
    const input = 'Esta é uma linha de letra';
    expect(parseChordSheet(input)).toBe(input);
  });

  it('should handle mixed chord and lyric lines', () => {
    const input = `C  Am  F  G
Eu vou cantar essa música
Dm  G  C
Com muito amor`;

    const expected = `<b>C</b>  <b>Am</b>  <b>F</b>  <b>G</b>
Eu vou cantar essa música
<b>Dm</b>  <b>G</b>  <b>C</b>
Com muito amor`;

    expect(parseChordSheet(input)).toBe(expected);
  });

  it('should preserve empty lines', () => {
    const input = `C  Am  F  G

Letra da música`;

    const expected = `<b>C</b>  <b>Am</b>  <b>F</b>  <b>G</b>

Letra da música`;

    expect(parseChordSheet(input)).toBe(expected);
  });

  it('should handle complex chords from cifraclub.com format', () => {
    const input = `G7M  D/F#  Em7  A7(9)
Eu vou cantar`;

    const expected = `<b>G7M</b>  <b>D/F#</b>  <b>Em7</b>  <b>A7(9)</b>
Eu vou cantar`;

    expect(parseChordSheet(input)).toBe(expected);
  });

  it('should preserve spacing between chords', () => {
    const input = 'C    Am     F  G';
    const expected = '<b>C</b>    <b>Am</b>     <b>F</b>  <b>G</b>';
    expect(parseChordSheet(input)).toBe(expected);
  });
});
