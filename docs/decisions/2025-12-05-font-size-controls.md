# Responsive Chord Wrapping - Technical Decision Document

**Date:** December 5, 2025  
**Status:** ⚠️ HISTORICAL DECISION - See `structured-data-refactoring-v2.md` for current implementation  
**Context:** Mobile optimization for Sigalacifra

---

**⚠️ NOTA IMPORTANTE:** Este documento descreve a decisão **inicial** de implementar controles de fonte (A+/A-) como solução MVP. A **refatoração estrutural completa** foi posteriormente iniciada no branch `refactor/structured-data` e está documentada em `docs/structured-data-refactoring-v2.md`. Mantenha este arquivo apenas como referência histórica da decisão arquitetural.

---

## Problem Statement

On mobile devices, some chord sheets contain lines longer than the viewport width, causing **horizontal scroll**. This creates poor UX as musicians need to scroll horizontally while playing instruments.

### Root Cause

Chord sheets rely on **monospace font alignment** (`<pre>` element with `white-space: pre`) to keep chords positioned exactly above their corresponding lyrics. This prevents automatic line wrapping.

Example of problematic line:
```
E/B    Dbm7    Gbm7    B7     E      Dbm7
Lança menina  Lança todo esse perfume, desbaratina
```

On narrow screens, this line forces horizontal scroll.

## Why There's No Simple Solution

The alignment problem is fundamental:

1. **`white-space: pre-wrap`** - Allows line breaks BUT breaks chord-lyric alignment (chords end up over wrong words)
2. **Reduce font size globally** - Makes everything less readable on mobile
3. **Viewport-based sizing** - Doesn't solve the core issue; still causes misalignment

**The trade-off:** Either maintain alignment (with scroll) OR allow wrapping (losing alignment).

## Implemented Solution (MVP)

### Font Size Controls (A+/A-)

Added two buttons that allow users to **dynamically adjust font size** between 10px and 20px (default: 16px).

**Key features:**
- Resets to 16px on each page load (no persistence)
- User decides when to sacrifice readability to avoid scroll
- Preserves monospace alignment
- Simple implementation (~20 lines of code)

**Files modified:**
- `src/song.html` - Added A+/A- buttons
- `src/scripts/song.js` - Font size control logic

**User flow:**
1. Open song with long lines (horizontal scroll appears)
2. Click A- multiple times to reduce font
3. Eventually content fits on screen without scroll
4. Navigate to next song → font resets to 16px (normal size)

### Why This Works for Our Use Case

- **Rare problem:** Most songs don't have overly long lines
- **Temporary adjustment:** User only reduces font when needed
- **Simple & risk-free:** No data migration, no breaking changes
- **5 users:** Easy to gather feedback and iterate

## Alternative Solution: Semantic Chord Structure (Cifra Club Approach)

### How Cifra Club Solves This

They use **semantic data structure** where chords are attached to specific syllables/words:

```javascript
// Instead of plain text with spacing:
"<b>E/B</b>    <b>Dbm7</b>\nLança menina"

// They use structured data:
[
  { syllable: 'Lança', chord: 'E/B' },
  { syllable: ' menina', chord: 'Dbm7' },
  // ...
]
```

This allows:
- ✅ Natural line wrapping (`white-space: pre-wrap`)
- ✅ Chords stay above correct words (positioned with CSS)
- ✅ Pinch-to-zoom works perfectly
- ✅ Responsive without horizontal scroll

### Why We're Not Doing This (Yet)

**Complexity estimate:** 3-6 months of part-time work

**Required changes:**

1. **Complete data model rewrite**
   - Restructure Firestore `letra` field from string to structured format
   - Migrate all existing songs (~significant risk)

2. **Parser rewrite**
   - Current parser detects chords by spacing/line analysis
   - New parser must determine which word each chord belongs to
   - All 22 existing tests become obsolete

3. **Rendering engine**
   - Replace `<pre>` with semantic HTML (divs/spans)
   - CSS positioning for chord-syllable relationships
   - Handle edge cases (multiple chords per word, chord-only lines)

4. **Editor complexity**
   - Current: `contentEditable` on `<pre>` (simple)
   - New: WYSIWYG editor to insert chords above specific words
   - Mobile keyboard for chord insertion
   - Drag-and-drop chord repositioning

5. **Testing**
   - Rewrite all 48 tests
   - Test chord positioning edge cases
   - Cross-browser/device compatibility

**Estimated effort breakdown:**
- Parser + data structure: 4-6 weeks
- Rendering engine: 2-3 weeks
- Editor/UI: 4-6 weeks
- Migration + testing: 2-3 weeks
- Bug fixes + polish: 2-4 weeks

**Total:** ~3-6 months (assuming part-time, careful development)

## Decision & Rationale

**Choice:** Implement font size controls (A+/A-) as MVP solution.

**Reasoning:**

1. **Time to market:** Carnival rehearsals start late 2025 - need working solution now
2. **Risk vs. reward:** Font controls = zero risk; semantic structure = major rewrite with migration risks
3. **User validation:** 5 musicians can test current approach; only invest months if they demand more
4. **Pragmatic MVP:** Solve 80% of problem with 1% of effort
5. **Defer complexity:** Can revisit semantic structure if app gains traction and users request it

## Future Considerations

If user feedback indicates strong need for auto-wrapping chords, consider **v2.0 rewrite** with:

- Semantic chord-syllable data structure
- WYSIWYG editor with specialized chord keyboard
- Drag-and-drop chord positioning (especially useful on tablets/desktop)
- Intelligent line breaking that preserves musical phrasing
- Offline migration tool for existing songs

**Trigger for v2.0:** Sustained user requests + evidence of frequent usage justifying months of dev time.

## Technical Notes

### Current Implementation Details

```javascript
// Font size control (song.js)
let currentFontSize = 16;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 20;

const updateFontSize = (newSize) => {
  currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
  preElement.style.fontSize = `${currentFontSize}px`;
};
```

**Design choice:** No localStorage persistence - font resets to default for each song. This ensures users don't forget they reduced font and then wonder why other songs look tiny.

### Why Monospace Alignment Works

```
D       Bm7     Em7
Lança   menina  Lança
```

In monospace font, each character (including spaces) has identical width. The chord `D` is positioned above `Lança` by counting spaces in the chord line. Breaking lines would misalign this spatial relationship.

## References

- **Implementation commit:** 8178486 (Dec 5, 2025)
- **Related files:** `src/song.html`, `src/scripts/song.js`, `src/css/style.css`
- **Cifra Club comparison:** See screenshots in project documentation
- **Parser tests:** `src/scripts/chordParser.test.js` (22 tests)

## Conclusion

The font size control solution is a **pragmatic choice** that:
- Solves the immediate problem with minimal code
- Preserves system simplicity and reliability
- Allows validation with real users before major investment
- Keeps door open for future sophisticated solution if justified

For a 5-user MVP rushing to carnival deadline, this is the right call.
