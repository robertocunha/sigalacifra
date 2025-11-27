# Sigalacifra - Project Context for Claude

## What is this project?

A web app for members of **Siga La Pelota**, a carnival block from São Paulo, Brazil, to manage chord sheets (cifras) for their rehearsals and performances. About 5 people will use it: musicians playing melodic/harmonic instruments (bass, guitar, keyboard) and vocalists.

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
    └── chordParser.js         # Converts plain text to HTML with <b> tags around chords
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
- ✅ Export/print (basic window.print())
- ✅ Create new song with chord parser (converts plain text to HTML automatically)
- ✅ "New Song" button on homepage

## What's Missing / Broken

- ❌ No way to delete songs
- ❌ No way to reorder songs (drag-drop or buttons)
- ❌ "Position" column shown to users (should be hidden, was for debug)
- ❌ No validation on forms
- ❌ No feedback messages (success/error)
- ❌ Print/export needs improvement
- ❌ No way to edit title/artist/tone directly
- ❌ Create song form has poor layout (all fields in one line)
- ❌ No "Format" button when editing existing songs (new text won't get chord styling)
- ❌ Mobile responsiveness not tested

## MVP Requirements (for carnival)

1. **Create songs** - Paste from cifraclub.com and save ✅ (done!)
2. **Edit songs** - Modify chords, add annotations like "Guitar enters alone"
3. **Transpose** - Change key up/down ✅ (works)
4. **Archive/unarchive** - Manage active repertoire ✅ (works)
5. **Reorder songs** - Change performance order (drag-drop ideal, buttons acceptable)
6. **Print/export** - Generate PDFs for printing

## Next Steps (Priority Order)

1. Improve create song form layout (fields stacked vertically, better spacing)
2. Hide "Position" column from users
3. Add "Format" button to song edit page (reuse chordParser)
4. Song reordering (buttons or drag-drop)
5. Improve print/export

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

## Notes

- Firebase API key is in the repo (acceptable for this low-risk project)
- No authentication needed - it's a small trusted group
- Backup is prudent but not critical (just chord sheets, not sensitive data)
