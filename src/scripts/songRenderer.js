import { wrapLine } from './lineWrapper.js';
import { renderLine } from './lineRenderer.js';

/**
 * Wraps annotation text by breaking it into multiple lines at word boundaries
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in characters
 * @returns {array} Array of wrapped lines
 */
function wrapAnnotation(text, maxWidth) {
  // If text fits, return as-is
  if (text.length <= maxWidth) {
    return [text];
  }
  
  const lines = [];
  const words = text.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    
    if (testLine.length > maxWidth && currentLine) {
      // Current line is full, start new line
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  // Don't forget the last line
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

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
      // Wrap annotations if they exceed maxWidth
      const wrappedAnnotations = wrapAnnotation(item.text, maxWidth);
      renderedLines.push(...wrappedAnnotations);
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
