import { wrapLine } from './lineWrapper.js';
import { renderLine } from './lineRenderer.js';

/**
 * Renders a complete song as HTML with chord wrapping
 * @param {array} linePairs - Array of line pair objects
 * @param {number} maxWidth - Maximum width in characters for wrapping
 * @returns {string} HTML string with <b> tags around chords
 */
export function renderSong(linePairs, maxWidth) {
  const renderedLines = [];
  
  for (const item of linePairs) {
    // Handle different types
    if (item.type === 'empty') {
      renderedLines.push('');
    } else if (item.type === 'annotation') {
      renderedLines.push(item.text);
    } else {
      // It's a line pair with chords and lyrics
      // Apply wrapping
      const wrappedLines = wrapLine(item, maxWidth);
      
      // Render each wrapped line
      for (const wrappedLine of wrappedLines) {
        const rendered = renderLine(wrappedLine, true); // Pass true for HTML
        renderedLines.push(rendered);
      }
    }
  }
  
  return renderedLines.join('\n');
}
