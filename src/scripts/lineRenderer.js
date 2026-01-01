/**
 * Renders structured line data back into text format
 * @param {object} lineData - Object with chords array and lyrics string
 * @param {boolean} html - If true, wraps chords in <b> tags
 * @returns {string} Rendered chord line + lyrics line separated by \n
 */
export function renderLine(lineData, html = false) {
  const { chords, lyrics } = lineData;
  
  if (html) {
    // Build chord line with HTML tags
    let chordLine = '';
    let currentPos = 0;
    
    for (const { position, chord } of chords) {
      // Add spaces before this chord
      chordLine += ' '.repeat(position - currentPos);
      // Add chord wrapped in <b> tag
      chordLine += `<b>${chord}</b>`;
      currentPos = position + chord.length;
    }
    
    // Add remaining spaces to match lyrics length
    if (currentPos < lyrics.length) {
      chordLine += ' '.repeat(lyrics.length - currentPos);
    }
    
    // Wrap chord+lyrics pair in span to prevent column/page breaks
    return `<span class="chord-lyrics-pair">${chordLine}\n${lyrics}</span>`;
  } else {
    // Plain text version (existing code)
    const chordLineArray = new Array(lyrics.length).fill(' ');
    
    // Place each chord at its position
    for (const { position, chord } of chords) {
      for (let i = 0; i < chord.length; i++) {
        chordLineArray[position + i] = chord[i];
      }
    }
    
    const chordLine = chordLineArray.join('');
    
    return chordLine + '\n' + lyrics;
  }
}
