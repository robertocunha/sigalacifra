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
- **Build**: Webpack (bundles JS/CSS, multiple entry points)
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
  letra: string       // HTML content with chords in <b> tags
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
- ✅ Export/print (basic window.print())
- ✅ Create new song with chord parser (converts plain text to HTML automatically)
- ✅ "New Song" button on homepage
- ✅ Create song form with proper Bootstrap layout, validation, and UX improvements (Dec 2025)
- ✅ Delete songs (with confirmation dialog) from lists and song page (Dec 2025)
- ✅ Font size controls (A+/A-) to adjust between 10px-20px, resets to 16px on page load (Dec 2025)

## What's Missing / Broken

- ❌ No way to reorder songs (drag-drop or buttons)
- ❌ No way to edit title/artist/tone directly
- ❌ Tone doesn't appear in print version (tonePrintId element not populating correctly)
- ⚠️ Long lines cause horizontal scroll - mitigated by font size controls (user can reduce font when needed)
- ⚠️ Unsaved changes warning (user can close page without saving edits)
- ⚠️ Android GBoard "two spaces → period" behavior cannot be disabled (attempted multiple approaches - OS-level limitation)

## MVP Requirements (for carnival)

1. **Create songs** - Paste from cifraclub.com and save ✅ (done!)
2. **Edit songs** - Modify chords, add annotations like "Guitar enters alone"
3. **Transpose** - Change key up/down ✅ (works)
4. **Archive/unarchive** - Manage active repertoire ✅ (works)
5. **Reorder songs** - Change performance order (drag-drop ideal, buttons acceptable)
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
8. Song reordering with buttons (up/down arrows, not drag-drop)

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
- **Coverage**: 48 automated tests covering critical functions
- **Run tests**: `npm test` (watch mode) or `npm run test:run` (single run)

### Test Coverage

**chordParser.js** (22 tests):
- Basic chord recognition (C, Am, G7, F#m, etc.)
- Complex chords (G7M(9), Csus4, Cdim, slash chords)
- Edge cases: E/Em/A as words vs. chords
- Chord line detection (>50% threshold)
- Full text parsing with mixed content

**transpose.js** (26 tests):
- Basic transposition up/down
- Sharp/flat notation (sharps when up, flats when down)
- Extensions preservation (7M, sus4, dim, aug)
- Slash chords (bass note transposition)
- Enharmonic equivalents and full circle validation
- Real-world progressions (I-IV-V, ii-V-I, bossa patterns)

### Known Limitations (Documented in Tests)

- Lines with exactly 50% chords are NOT parsed (need >50%)
  - Example: "Solo: Em" = 50% → not parsed
  - Acceptable trade-off to avoid false positives
- Chords embedded in descriptive text are not parsed
  - Example: "no breque do D7 entra o vocal" → D7 not parsed
  - Intentional: prevents false positives in lyrics

## Recent Changes (Changelog)

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
