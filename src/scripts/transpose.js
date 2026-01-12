/**
 * Transpose Module
 * Functions for transposing musical chords.
 */

/**
 * Transposes a complete chord, preserving extensions and bass notes.
 * 
 * @param {string} chord - The chord to transpose (e.g., "G7M", "D/F#", "Am7", "D#7/9M")
 * @param {number} semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns {string} - The transposed chord
 */
export function transposeChord(chord, semitones) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const flatEquivalents = { "A#": "Bb", "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab" };

  // Updated regex to support both bass notes (/F#) and extensions (/9M, /9+, /9-)
  const match = chord.match(/^([A-G][#b]?)(.*?)(\/([A-G][#b]?|[0-9]+(M|maj|\+|-)?))?$/);
  if (!match) return chord;

  const [, root, extensions = "", slashPart = "", slashContent = ""] = match;
  
  // Check if the slash part is a note (needs transposition) or an extension (keep as is)
  const isNote = /^[A-G][#b]?$/.test(slashContent);
  
  const transposedRoot = transposeNote(root, semitones, notes, flatEquivalents);
  
  if (isNote) {
    // It's a bass note - transpose it
    const transposedBass = transposeNote(slashContent, semitones, notes, flatEquivalents);
    return `${transposedRoot}${extensions}/${transposedBass}`;
  } else {
    // It's an extension - keep as is
    return `${transposedRoot}${extensions}${slashPart}`;
  }
}

/**
 * Transposes a single note (without extensions or bass).
 * 
 * @param {string} note - The note to transpose (e.g., "C", "F#", "Bb")
 * @param {number} semitones - Number of semitones to transpose
 * @param {Array<string>} notes - Array of note names (sharps)
 * @param {Object} flatEquivalents - Map of sharp to flat equivalents
 * @returns {string} - The transposed note
 */
function transposeNote(note, semitones, notes, flatEquivalents) {
  const sharpNote = note.replace(/(Db|Eb|Gb|Ab|Bb)/g, match =>
    Object.entries(flatEquivalents).find(([sharp, flat]) => flat === match)[0]
  );
  let index = notes.indexOf(sharpNote);
  if (index === -1) return note;

  index = (index + semitones + notes.length) % notes.length;
  let transposedNote = notes[index];

  if (semitones < 0 && flatEquivalents[transposedNote]) {
    transposedNote = flatEquivalents[transposedNote];
  }

  return transposedNote;
}
