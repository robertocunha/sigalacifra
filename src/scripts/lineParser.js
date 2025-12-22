/**
 * Parses a pair of chord and lyrics lines into structured data
 * @param {string} chordLine - Line containing chords with spacing
 * @param {string} lyricsLine - Line containing lyrics
 * @returns {object} Structured data with chords array and lyrics string
 */
export function parseLine(chordLine, lyricsLine) {
  const chords = [];
  
  // Find all chords and their positions
  let position = 0;
  let currentChord = '';
  
  for (let i = 0; i < chordLine.length; i++) {
    const char = chordLine[i];
    
    if (char !== ' ') {
      // Building a chord
      if (currentChord === '') {
        position = i; // Start of chord
      }
      currentChord += char;
    } else {
      // Space found - end of chord (if we were building one)
      if (currentChord !== '') {
        chords.push({ position, chord: currentChord });
        currentChord = '';
      }
    }
  }
  
  // Don't forget last chord if line doesn't end with space
  if (currentChord !== '') {
    chords.push({ position, chord: currentChord });
  }
  
  return {
    chords,
    lyrics: lyricsLine
  };
}
