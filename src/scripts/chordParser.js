/**
 * Chord Parser Module
 * Converts plain text with chords into HTML with <b> tags around chords.
 */

/**
 * Checks if a string looks like a musical chord.
 * 
 * Valid chord patterns:
 * - Root note: A, B, C, D, E, F, G
 * - Accidentals: # or b
 * - Quality: m (minor), dim, aug
 * - Extensions: 7, 9, 11, 13, 6, 4, 2
 * - Major 7th: M or maj (can come before or after the number, e.g., CM7 or C7M)
 * - Modifiers: sus, add
 * - Parenthetical: (9), (b5), (11), etc.
 * - Bass note: /X where X is another note
 * 
 * @param {string} token - The string to check
 * @returns {boolean} - True if it looks like a chord
 */
function isChord(token) {
  // Remove whitespace
  token = token.trim();
  
  // Empty string is not a chord
  if (!token) return false;
  
  // Chord regex pattern - handles various chord notations
  // Examples: C, Am, G7, D7M, G7M(9), F#m7, Bb, Csus4, G/B, A7(9), Eb7M(9), CM7, Cmaj7, C7+
  const chordPattern = /^[A-G][#b]?(m(?!aj)|dim|aug|°|\+)?(sus[24]?)?(add)?(M|maj)?[0-9]*(M|maj|\+)?(\([^)]+\))?([#b][0-9]+)?(\/[A-G][#b]?)?$/;
  
  return chordPattern.test(token);
}

/**
 * Analyzes a line and determines if it's primarily a chord line.
 * A line is considered a "chord line" if more than 50% of its 
 * meaningful tokens (words) are chords.
 * 
 * @param {string} line - The line to analyze
 * @returns {boolean} - True if it's a chord line
 */
function isChordLine(line) {
  // Split by whitespace, filter out empty strings
  const tokens = line.split(/\s+/).filter(t => t.length > 0);
  
  // Empty line is not a chord line
  if (tokens.length === 0) return false;
  
  // Count how many tokens look like chords
  const chordCount = tokens.filter(t => isChord(t)).length;
  
  // If 50% or more are chords, it's a chord line
  return chordCount / tokens.length >= 0.5;
}

/**
 * Converts a chord line to HTML, wrapping each chord in <b> tags.
 * Preserves spacing between chords.
 * 
 * @param {string} line - A line that contains chords
 * @returns {string} - The line with chords wrapped in <b> tags
 */
function convertChordLineToHtml(line) {
  // Replace each chord with <b>chord</b>, preserving spacing
  // We use a regex that matches words and check if each is a chord
  return line.replace(/(\S+)/g, (match) => {
    if (isChord(match)) {
      return `<b>${match}</b>`;
    }
    return match;
  });
}

/**
 * Parses plain text with chords and converts it to HTML.
 * - Chord lines: chords are wrapped in <b> tags
 * - Lyric lines: kept as-is
 * - Empty lines: preserved
 * 
 * @param {string} text - Plain text with chords (e.g., from Cifra Club)
 * @returns {string} - HTML formatted text
 */
function parseChordSheet(text) {
  const lines = text.split('\n');
  
  const htmlLines = lines.map(line => {
    // Empty or whitespace-only lines: preserve them
    if (line.trim() === '') {
      return line;
    }
    
    // Check if it's a chord line
    if (isChordLine(line)) {
      return convertChordLineToHtml(line);
    }
    
    // Otherwise, it's a lyric line - keep as-is
    return line;
  });
  
  return htmlLines.join('\n');
}

// Export for use in other modules
export { isChord, isChordLine, parseChordSheet };
