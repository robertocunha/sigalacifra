import { parseLine } from './lineParser.js';
import { isChordLine } from './chordParser.js';

/**
 * Parses a complete song text into structured line pairs
 * @param {string} text - Plain text with chords and lyrics
 * @returns {array} Array of line pair objects
 */
export function parseSong(text) {
  const lines = text.split('\n');
  const linePairs = [];
  
  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i];
    
    // Preserve empty lines
    if (currentLine.trim() === '') {
      linePairs.push({ type: 'empty' });
      i++;
      continue;
    }
    
    // Check if this is a chord line
    if (isChordLine(currentLine)) {
      const chordLine = currentLine;
      
      // Look ahead to see if next line is lyrics or another chord line
      const nextLine = lines[i + 1];
      let lyricsLine = '';
      let skipLines = 1; // By default, skip only the chord line
      
      if (nextLine && nextLine.trim() !== '' && !isChordLine(nextLine)) {
        // Next line is lyrics
        lyricsLine = nextLine;
        skipLines = 2; // Skip both chord and lyrics lines
      }
      // else: next line is empty, another chord line, or doesn't exist
      // In these cases, lyricsLine stays empty
      
      // Parse the pair
      const linePair = parseLine(chordLine, lyricsLine);
      linePairs.push(linePair);
      
      i += skipLines;
    } else {
      // It's a text line without chords (annotation)
      linePairs.push({ type: 'annotation', text: currentLine });
      i++;
    }
  }
  
  return linePairs;
}
