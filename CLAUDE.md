# Sigalacifra - Project Context for Claude

## What is this project?

A web app for members of **Siga La Pelota**, a carnival block from São Paulo, Brazil, to manage chord sheets (cifras) for their rehearsals and performances. About 5 people will use it: musicians playing melodic/harmonic instruments (bass, guitar, keyboard) and vocalists.

## Users & Feedback Loop

- **Small, accessible group**: ~5 musicians from Siga La Pelota
- **Direct communication**: Roberto can easily reach all users for feedback
- **Iteration-friendly**: Can ship simple solutions, gather real feedback, and refine
- **Decision-making**: When uncertain, prefer simple MVP over speculation - users can validate quickly

## Current Status

- **Live at**: https://sigalacifra.web.app/
- **Stage**: Working prototype, incomplete. Created as a weekend experiment ~1 year ago, now being revived for actual use.
- **Deadline**: Must be functional for carnival rehearsals starting late 2025.

## Tech Stack

- **Frontend**: Vanilla JavaScript + Bootstrap 5
- **Backend**: Firebase (Firestore database + Hosting)
- **Build**: Webpack (bundles JS/CSS, multiple entry points, CopyWebpackPlugin for images)
- **Libraries**: SortableJS (drag-and-drop reordering)
- **No framework** - intentionally simple

## Project Structure

```
src/
├── index.html / index.js      # Active songs list
├── archived.html / archived.js # Archived songs list  
├── song.html / song.js        # Single song view (edit, transpose, save)
├── createSong.html / createSong.js # Create new song
├── css/
│   ├── style.css              # Main styles
│   └── print.css              # Print styles
├── images/
│   └── logo.png               # App logo (6.74 MB, needs optimization)
└── scripts/
    ├── firebaseConfig.js      # Firebase initialization
    ├── chordParser.js         # Converts plain text to HTML with <b> tags around chords
    ├── chordParser.test.js    # 22 automated tests for chord parser
    ├── transpose.js           # Chord transposition logic (shared module)
    └── transpose.test.js      # 26 automated tests for transposition
```

## Data Model (Firestore)

Collection: `musicas`

```javascript
{
  title: string,      // Song title
  artist: string,     // Artist name
  tone: string,       // Current key (e.g., "D", "G#m", "Ebm")
  position: number,   // Order in list (increments by 10)
  active: boolean,    // true = active list, false = archived
  letra: string       // Plain text with chords and lyrics (Dec 2025: changed from parsed structure to plain text)
}
```

## What Works

- ✅ List active songs (real-time updates via onSnapshot)
- ✅ List archived songs
- ✅ View single song with colored chords
- ✅ Toggle active/archived status via checkbox
- ✅ Transpose chords up/down (with proper handling of extensions and bass notes)
- ✅ Edit song content (contentEditable)
- ✅ Save changes to Firestore
- ✅ Auto-format chords on save (newly added chords automatically styled in orange)
- ✅ Export/print with tone visible (Dec 2025)
- ✅ Create new song with chord parser (converts plain text to HTML automatically)
- ✅ "New Song" button accessible from all pages
- ✅ Create song form with proper Bootstrap layout, validation, and UX improvements (Dec 2025)
- ✅ Delete songs (with confirmation dialog) from lists and song page (Dec 2025)
- ✅ Font size controls (A+/A-) to adjust between 10px-20px, resets to 16px on page load (Dec 2025)
- ✅ Drag-and-drop song reordering with touch-optimized handles (Dec 2025)
- ✅ Consistent navigation with page indicators (Dec 2025)
- ✅ Smart redirects after delete/cancel/save (Dec 2025)
- ✅ Unsaved changes warning when leaving page (Dec 2025)
- ✅ Keyboard shortcuts (Ctrl+S to save, Ctrl+E to toggle edit mode) (Dec 2025)
- ✅ Visual save feedback with dismissible notification (Dec 2025)
- ✅ Responsive logo across all pages (15vh on lists, 8vh on song page) (Dec 2025)

## What's Missing / Broken

- ❌ No way to edit title/artist/tone directly
- ⚠️ Print layout inefficient: single song often takes 4-5 pages. Need two-column layout for print to fit in 1-2 pages (like traditional songbooks). **See [structured-data-refactoring-v2.md](docs/structured-data-refactoring-v2.md) for detailed solution plan.**
- ⚠️ Bulk print: select multiple songs from list and print all at once (useful for carnival prep, low priority until February)

## Documentation Structure

**Primary context file:** This file (`CLAUDE.md`) provides high-level project overview and changelog.

**Detailed technical documentation:**
- **[docs/structured-data-refactoring-v2.md](docs/structured-data-refactoring-v2.md)** - Complete architecture of chord/lyrics parsing, rendering, and wrapping system. Read this for deep understanding of the codebase's core modules.
- **[docs/analysis2025December.md](docs/analysis2025December.md)** - Module-by-module code analysis with examples and test coverage details.

**Historical decisions:**
- **[docs/decisions/2025-12-05-font-size-controls.md](docs/decisions/2025-12-05-font-size-controls.md)** - Original decision to implement A+/A- controls as MVP before structured data refactoring.

## Current Work: Structured Data Refactoring (Dec 18-24, 2025)

**Problem**: Long chord/lyrics lines cause horizontal scroll on mobile, especially when users increase font size.

**Solution**: Convert plain text chord sheets to structured data that separates chords (with positions) from lyrics, enabling intelligent line wrapping that preserves chord-to-syllable alignment.

**Status**: ✅ **COMPLETED AND INTEGRATED** (Dec 24, 2025)
- ✅ All core modules implemented (lineParser, lineRenderer, lineWrapper, songParser, songRenderer)
- ✅ Recursive line wrapping (handles extremely long lines)
- ✅ Integration with song.js (parse on load, cache linePairs)
- ✅ Architecture fixed: Firebase stores plain text, parsing happens on read
- ✅ 64 tests passing (16 new tests for structured data modules)
- ✅ maxWidth calculated by actual measurement (not estimation)
- ✅ Chord line detection fixed (>= 50% threshold)

**Next steps:** Print layout (two-column), additional edge case tests, mobile UX polish.

**See [docs/structured-data-refactoring-v2.md](docs/structured-data-refactoring-v2.md)** for complete technical details.

## MVP Requirements (for carnival)

1. **Create songs** - Paste from cifraclub.com and save ✅ (done!)
2. **Edit songs** - Modify chords, add annotations like "Guitar enters alone" ✅ (done!)
3. **Transpose** - Change key up/down ✅ (works)
4. **Archive/unarchive** - Manage active repertoire ✅ (works)
5. **Reorder songs** - Change performance order ✅ (drag-drop implemented!)
6. **Print/export** - Generate PDFs for printing

## Next Steps (Priority Order)

### High Priority: Mobile Usability (In Progress)
**Context**: Musicians will use the app on phones during rehearsals/performances, often with instruments in hand.

1. **Mobile responsiveness audit** ✅ **DONE (Dec 3, 2025)**
   - ✅ Tested song page on mobile via scrcpy
   - ✅ Increased font size to 16px for better legibility
   - ✅ Adjusted line-height for consistent spacing
   - ✅ Reorganized controls into single row with proper sizing
   - ✅ Hidden "Position" column from song lists

2. **Optimize transposition for mobile** ✅ **DONE (Dec 3, 2025)**
   - ✅ Large, easy-to-tap +/- buttons (btn-lg)
   - ✅ Prominent placement with tone display between buttons
   - ✅ Clear visual feedback on key changes

3. **Improve touch targets** ✅ **DONE (Dec 3, 2025)**
   - ✅ All buttons min 48px height
   - ✅ Better spacing with Bootstrap gap utilities
   - ✅ Toggle switch for edit mode (clear on/off state)

4. **Optimize editing for mobile** ✅ **DONE (Dec 3, 2025)**
   - ✅ Disabled spellcheck (no more distracting underlines)
   - ✅ Disabled autocorrect and autocomplete
   - ✅ Re-enabled autocapitalize (natural text input)
   - ✅ Added padding to pre element (cursor always visible)
   - ✅ Visual feedback on edit mode (yellow background)
   - ✅ Auto-focus when entering edit mode

5. **Remaining mobile tasks**
   - Test create song page on mobile
   - Test song lists (active/archived) on mobile
   - Verify navigation flows on mobile

### Medium Priority: Core Features

6. ✅ **DONE** - Hide "Position" column from users (Dec 3, 2025)
7. ✅ **DONE** - Auto-format chords on save (Dec 5, 2025)
8. ✅ **DONE** - Drag-and-drop song reordering (Dec 5, 2025)

### Low Priority: Nice-to-Have

9. Improve print/export (when desktop usage becomes relevant)
10. Aesthetic improvements (after usability is solid)
11. Optimize song creation for mobile (acceptable to do on desktop for now)

## Code Conventions

- **Language**: All code in English (variables, comments, file names)
- **Style**: Keep it simple, no over-engineering
- **Direct edits**: Claude can make changes directly, Roberto will review via VS Code UI

## About Roberto (the developer)

- Bachelor's in Information Systems (Unesp, ~15 years ago)
- 10 years teaching web development to beginners
- Strong fundamentals, limited industry experience
- Comfortable with HTML/CSS/JS, terminal, Git
- Prefers concise answers (can ask for details when needed)
- Appreciates unsolicited suggestions and learning opportunities

## Working Style

- One chat per task/topic
- This file serves as persistent context between sessions
- Roberto is enthusiastic about human-AI collaboration
- No need for excessive caution - Git provides safety net
- Prefers small incremental steps over big changes (learning opportunity)
- Commits: atomic, frequent, with conventional commit prefixes (feat:, fix:, docs:)

## Testing

- **Framework**: Vitest (lightweight, ES modules compatible)
- **Coverage**: 64 automated tests covering critical functions (Dec 2025: was 48)
- **Run tests**: `npm test` (watch mode) or `npm run test:run` (single run)

### Test Coverage

**chordParser.js** (22 tests):
- Basic chord recognition (C, Am, G7, F#m, etc.)
- Complex chords (G7M(9), Csus4, Cdim, slash chords)
- Edge cases: E/Em/A as words vs. chords
- **Chord line detection:** >= 50% threshold (Dec 2025: changed from > 50%)
- Chord line detection (>50% threshold)
- Full text parsing with mixed content

**transpose.js** (26 tests):
- Basic transposition up/down
- Sharp/flat notation (sharps when up, flats when down)
- Extensions preservation (7M, sus4, dim, aug)
- Slash chords (bass note transposition)
- Enharmonic equivalents and full circle validation
- Real-world progressions (I-IV-V, ii-V-I, bossa patterns)

**Structured Data Modules** (16 tests - Dec 2025):
- **lineParser.js** (3 tests): Parse text lines to structured data
- **lineRenderer.js** (3 tests): Render structure back to text with round-trip validation
- **lineWrapper.js** (3 tests): Intelligent line wrapping without splitting chords (includes recursive wrapping)
- **songParser.js** (4 tests): Parse complete song text to array of linePairs
- **songRenderer.js** (3 tests): Render complete song with wrapping applied

**Total**: 64 tests passing

### Known Limitations (Documented in Tests)

- Lines with exactly 50% chords were NOT parsed initially (needed >50%)
  - **FIXED Dec 24, 2025:** Threshold changed to >= 50%
  - Example: "F#7(4)  (frase)" now correctly recognized
- Chords embedded in descriptive text are not parsed
  - Example: "no breque do D7 entra o vocal" → D7 not parsed
  - Intentional: prevents false positives in lyrics

## Recent Changes (Changelog)

### December 18-19, 2025 (Session 9 - Structured Data Refactoring - In Progress)
- **Created comprehensive refactoring plan** (docs/structured-data-refactoring-v2.md)
  - Documented problem: horizontal scroll on mobile with long lines
  - Designed solution: structured data separating chords (with positions) from lyrics
  - Defined algorithms for parsing, rendering, and intelligent line wrapping
- **Implemented core modules with TDD approach** (57 total tests passing)
  - lineParser.js: Converts text chord/lyrics lines to structure {chords: [{position, chord}], lyrics}
  - lineRenderer.js: Renders structure back to text with round-trip validation
  - lineWrapper.js: Intelligent line breaking that preserves chord-syllable alignment
  - Critical feature: Detects when break point would split chord, adjusts to avoid cutting chords
### December 24, 2025 (Session 10 - Architecture Fix & Bug Fixes)
- **Fixed Data Architecture** (commit: 3e3e813)
  - **BREAKING CHANGE:** Firebase now stores plain text instead of parsed structure
  - Follows "parse on read, not on write" principle
  - Benefits: easier editing, no migration needed, smaller storage, clear data/presentation separation
  - `createSong.js`: Removed `parseSong()`, now saves `lyricsRaw` directly
  - `song.js`: Added `parseSong()` on load, caches `linePairs` in memory
  - All re-render functions (resize, font change, transpose) use cached `linePairs`
- **Improved maxWidth Calculation**
  - Changed from estimation (fontSize * 0.6) to actual measurement
  - Creates temporary `<span>` with 100 chars, measures real width
  - More accurate line wrapping on different screens/fonts
- **Fixed Chord Line Detection**
  - Changed threshold from `> 0.5` to `>= 0.5`
  - Fixes recognition of lines like "F#7(4)  (frase)" (50% chords)
  - Now correctly identifies and transposes edge cases
- **Documentation**
  - Created `docs/analysis2025December.md` with detailed architecture explanation
  - Comprehensive module-by-module breakdown with examples
  - 64 tests passing (16 new tests for structured data modules)

### December 18-19, 2025 (Session 9 - Structured Data Refactoring)
- **Created comprehensive refactoring plan** (docs/structured-data-refactoring-v2.md)
  - Documented problem: horizontal scroll on mobile with long lines
  - Designed solution: structured data separating chords (with positions) from lyrics
  - Defined algorithms for parsing, rendering, and intelligent line wrapping
- **Implemented core modules with TDD approach**
  - lineParser.js: Converts text chord/lyrics lines to structure {chords: [{position, chord}], lyrics}
  - lineRenderer.js: Renders structure back to text with round-trip validation
  - lineWrapper.js: Intelligent line breaking that preserves chord-syllable alignment
  - songParser.js: Parse complete song text to array of linePairs
  - songRenderer.js: Render complete song with wrapping applied
  - Critical feature: Detects when break point would split chord, adjusts to avoid cutting chords
  - Recursive wrapping: Handles extremely long lines (multiple breaks)
- **Branch**: refactor/structured-data
- **Status**: ✅ **COMPLETED AND INTEGRATED** (Dec 24, 2025)

### December 6, 2025 (Session 8 - Responsive Logo)
- **Responsive Logo Implementation** (commit: 03fba72)
  - Created logo with Leonardo.ai based on Siga La Pelota carnival block
  - Configured webpack with CopyWebpackPlugin for image asset management
  - Implemented responsive sizing using viewport units (vh)
  - Logo size: 15vh on list pages, 8vh on song page (space optimization)
  - Logo scales proportionally with screen size for optimal mobile/desktop display
  - Maintained 1rem navbar padding for consistent spacing
  - Logo files stored in src/images/ and docs/ (reference materials)

### December 5, 2025 (Session 7 - Print/Export Fixes)
- **Fixed Print Functionality** (commit: 4f68567)
  - Tone now appears correctly in print preview and printed output
  - Removed conflicting Bootstrap classes (d-none, d-print-block)
  - Created dedicated `#tonePrintWrapper` element with explicit print visibility
  - Tone now visible both on screen and in print (improved UX)
  - Updated print.css to include `#tonePrintWrapper` and children in visible elements
  - Added print button (🖨️) to song page for easier access to print dialog

### December 5, 2025 (Session 6 - Navigation Improvements)
- **Enhanced Navigation & UX** (commit: 4f68567)
  - Standardized page titles: "Siga La Cifra! | [Section]"
  - Added semantic HTML structure (header/main) to all pages
  - Unified navbar with brand logo across all pages
  - Added visual indicators for current page (bold, no link)
  - Made "Siga La Cifra!" logo clickable to return to home
  - Smart redirects after actions:
    - Delete redirects to appropriate list (active/archived)
    - Cancel button returns to previous page using history
    - Create song redirects to view newly created song
  - Unsaved changes warning (beforeunload) for:
    - Content edits in edit mode
    - Chord transpositions
  - Keyboard shortcuts:
    - Ctrl+S / Cmd+S: Save changes
    - Ctrl+E / Cmd+E: Toggle edit mode
  - Save feedback improvements:
    - Green notification with success message
    - "Don't show again" option (saved in localStorage)
    - Auto-dismisses after 3 seconds with fade out
    - Automatically exits edit mode after save
  - Removed arrow key shortcuts for transposition (conflicts with scrolling)

### December 5, 2025 (Session 5 - Drag-and-Drop Reordering)
- **Song Reordering with Drag-and-Drop** (commit: 5a76f86)
  - Installed SortableJS library (4KB, mobile-optimized)
  - Added drag handle (⋮⋮) as first column in song list
  - Handle-only dragging (prevents conflict with scrolling)
  - Increased row height to 60px with 15px padding for better touch targets
  - Visual feedback during drag (ghost, chosen, and drag states)
  - Batch update to Firestore on drop (efficient, single transaction)
  - Recalculates all positions with 10-unit gaps (10, 20, 30...)
  - Real-time sync via onSnapshot (changes reflect immediately)
  - Tested on desktop and mobile - excellent usability
  - Inspired by Cifra Club mobile app UX

### December 5, 2025 (Session 4 - Font Size Controls)
- **Font Size Adjustment Feature**
  - Added A+/A- buttons to song page for dynamic font size control
  - Range: 10px to 20px (default: 16px)
  - Resets to default on each page load (no persistence)
  - User can temporarily reduce font to avoid horizontal scroll on long lines
  - Simple solution that preserves chord alignment while giving user control

### December 5, 2025 (Session 3 - Delete Songs)
- **Delete Song Functionality** (commit: d3c2413)
  - Added 'Ações' column with delete button (🗑️) to song lists (index.html, archived.html)
  - Implemented deleteDoc in index.js, archived.js, and song.js
  - Added confirmation dialog before deleting
  - Song page redirects to index.html after successful deletion
  - Real-time list updates in active songs, manual row removal in archived songs
  - All 48 tests passing

### December 3, 2025 (Session 2 - Testing)
- **Automated Testing Setup** (commits: ae667ac, 3a1f1aa, e1260d0)
  - Configured project for ES modules (required for Vitest)
  - Added Vitest with 48 tests for chord parser and transposition
  - Refactored song.js to use transpose.js module (eliminated ~40 lines of duplication)
  - Documented edge cases and trade-offs in test comments
  - All tests passing, providing confidence for future changes

### December 3, 2025 (Session 1 - Create Song)
- **Create Song Form Improvements** (commits: 618040b, 7534e36)
  - Redesigned with Bootstrap grid layout (responsive columns)
  - Added proper form validation with required field indicators (*)
  - Added helpful placeholders in italic style
  - Removed manual position field (songs now auto-added to end of list)
  - Added cancel button and improved navbar
  - Added loading state during save and auto-redirect after success
  - Cleaned up unused position conflict functions

## Notes

- Firebase API key is in the repo (acceptable for this low-risk project)
- No authentication needed - it's a small trusted group
- Backup is prudent but not critical (just chord sheets, not sensitive data)
- New songs are always added at the end (position = last + 10), manual positioning removed in favor of future drag-drop reordering
