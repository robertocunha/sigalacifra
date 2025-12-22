/**
 * Wraps a line into multiple lines if it exceeds max width
 * @param {object} lineData - Line data with chords and lyrics
 * @param {number} maxWidth - Maximum width in characters
 * @returns {array} Array of line data objects (one or more)
 */
export function wrapLine(lineData, maxWidth) {
  const { chords, lyrics } = lineData;
  
  // Check if line fits
  const lyricsLength = lyrics.length;
  
  // Calculate chord line length (position of last chord + its length)
  let chordLineLength = 0;
  if (chords.length > 0) {
    const lastChord = chords[chords.length - 1];
    chordLineLength = lastChord.position + lastChord.chord.length;
  }
  
  const maxLineLength = Math.max(lyricsLength, chordLineLength);
  
  // If it fits, return as-is
  if (maxLineLength <= maxWidth) {
    return [lineData];
  }
  
  // Need to wrap - find break point
  // Look for last space before maxWidth in lyrics
  let breakPoint = -1;
  for (let i = maxWidth; i >= 0; i--) {
    if (lyrics[i] === ' ') {
      // Try breaking after the space (i+1)
      let candidateBreakPoint = i + 1;
      
      // Check if this break point would split any chord
      let wouldSplitChord = false;
      for (const { position, chord } of chords) {
        const chordEnd = position + chord.length;
        // Chord is split if it starts before breakPoint but extends beyond it
        if (position < candidateBreakPoint && chordEnd > candidateBreakPoint) {
          wouldSplitChord = true;
          break;
        }
      }
      
      // If this break point would split a chord, try breaking before the space instead
      if (wouldSplitChord) {
        candidateBreakPoint = i;
        
        // Check again with the earlier break point
        wouldSplitChord = false;
        for (const { position, chord } of chords) {
          const chordEnd = position + chord.length;
          if (position < candidateBreakPoint && chordEnd > candidateBreakPoint) {
            wouldSplitChord = true;
            break;
          }
        }
      }
      
      // If we found a valid break point, use it
      if (!wouldSplitChord) {
        breakPoint = candidateBreakPoint;
        break;
      }
      // Otherwise, keep looking for an earlier space
    }
  }
  
  // If no space found, can't wrap gracefully (edge case)
  // Return as-is to avoid infinite recursion
  if (breakPoint === -1) {
    return [lineData];
  }
  
  // Split lyrics
  const firstLyrics = lyrics.substring(0, breakPoint);
  const secondLyrics = lyrics.substring(breakPoint);
  
  // Split chords based on break point
  const firstChords = [];
  const secondChords = [];
  
  for (const { position, chord } of chords) {
    const chordEnd = position + chord.length;
    if (chordEnd <= breakPoint) {
      // Entire chord fits in first line
      firstChords.push({ position, chord });
    } else {
      // Chord goes to second line
      secondChords.push({ position: position - breakPoint, chord });
    }
  }
  
  const firstPart = { chords: firstChords, lyrics: firstLyrics };
  const secondPart = { chords: secondChords, lyrics: secondLyrics };
  
  // Recursively wrap the second part if it's still too long
  const wrappedSecondPart = wrapLine(secondPart, maxWidth);
  
  return [firstPart, ...wrappedSecondPart];
}
