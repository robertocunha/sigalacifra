# Structured Data Refactoring - Planning Document

## Problem Statement

### Current Implementation Issues

The app currently stores song lyrics with chords embedded as HTML (`<b>` tags) within a single string. This approach causes critical problems:

**1. Print Layout Inefficiency**
- Single song often takes 4-5 printed pages
- Two-column layout would dramatically reduce page count (1-2 pages typical)
- Cannot implement two-column layout with current HTML structure

**2. Chord Alignment Preservation**
- Chords must stay precisely aligned above their corresponding syllables
- Current structure: chords and lyrics are interleaved in plain text
- CSS column breaks or word wrapping would destroy alignment

### The Core Challenge: Semantic Structure

Chord sheets have inherent semantic structure that must be preserved:

```
[line of chords - positioned above specific syllables]
[line of lyrics - corresponding to chords above]
[blank line - visual separator]
```

**Example:**
```
                 Dm7          G7               C                 A7
Era uma casa muito engraçada, não tinha     teto,     não tinha nada
                        Dm7           G7       C            A7
Ninguém podia entrar nela, não, porque na casa não tinha chão
```

**What happens with naive CSS solutions:**

If we apply `word-wrap` or `column-count` directly to current HTML:

```
Column 1:                           Column 2:
Dm7    G7                          C    A7   Dm7
Era uma casa                       não tinha teto
```

❌ Chords become misaligned with syllables  
❌ Musical meaning is destroyed  
❌ Unplayable for musicians

## Proposed Solution: Structured Data Model

### New Data Structure

Instead of storing HTML strings, store songs as structured data:

```javascript
{
  title: string,
  artist: string,
  tone: string,
  position: number,
  active: boolean,
  sections: [
    {
      type: "verse" | "chorus" | "bridge" | "intro" | "outro" | "other",
      label?: string,  // Optional: "Verse 1", "Chorus", etc.
      lines: [
        {
          chords: [
            { position: number, chord: string },
            // position = character index in lyrics where chord appears
          ],
          lyrics: string
        }
      ]
    }
  ]
}
```

### Example: Complete Song Structure

```javascript
{
  title: "Casa",
  artist: "Vinicius de Moraes",
  tone: "C",
  position: 10,
  active: true,
  sections: [
    {
      type: "verse",
      lines: [
        {
          chords: [
            { position: 17, chord: "Dm7" },
            { position: 27, chord: "G7" },
            { position: 40, chord: "C" },
            { position: 57, chord: "A7" },
            { position: 64, chord: "Dm7" },
            { position: 81, chord: "G7" },
            { position: 88, chord: "C" }
          ],
          lyrics: "Era uma casa muito engraçada, não tinha teto, não tinha nada"
        },
        {
          chords: [
            { position: 24, chord: "Dm7" },
            { position: 33, chord: "G7" },
            { position: 40, chord: "C" },
            { position: 57, chord: "A7" },
            { position: 70, chord: "Dm7" },
            { position: 77, chord: "G7" },
            { position: 84, chord: "C" }
          ],
          lyrics: "Ninguém podia entrar nela, não, porque na casa não tinha chão"
        }
      ]
    }
  ]
}
```

## Benefits of Structured Data

### 1. Flexible Rendering
- **Screen view**: Render as `<pre>` with inline `<b>` tags (current style)
- **Print view**: Render in two columns with intelligent breaks
- **Future**: Could support chord diagrams, tablature, etc.

### 2. Intelligent Line Breaking
- Each line is an atomic unit
- Can break between lines, never within a line
- Preserves chord-syllable alignment perfectly

### 3. Two-Column Print Layout
```javascript
// Pseudocode for two-column rendering
sections.forEach(section => {
  section.lines.forEach(line => {
    renderChordLine(line.chords, line.lyrics);  // Atomic unit
    renderLyricsLine(line.lyrics);
  });
});
```

CSS:
```css
@media print {
  .song-content {
    column-count: 2;
    column-gap: 2rem;
  }
  
  .line-unit {
    break-inside: avoid;  /* Never break within a line */
  }
}
```

### 4. Cleaner Transposition
- Only modify chord objects in the `chords` array
- No need to parse/re-render entire HTML
- More reliable, easier to test

### 5. Better Editing Experience
- Can build structured editor in the future
- For now: parse on input, store structured, render on output
- Maintains backward compatibility with copy-paste from cifraclub.com

## Implementation Plan

### Phase 1: Foundation (1-2 days)

**1.1 Define Data Structure**
- Create TypeScript-style interface documentation
- Define validation rules
- Document edge cases

**1.2 Create Parser (text → structure)**
- Input: Plain text with chords (like from cifraclub.com)
- Output: Structured data object
- Reuse existing `chordParser.js` logic where possible
- Handle:
  - Chord lines (detect and extract positions)
  - Lyrics lines
  - Section detection (verses, chorus, etc.)
  - Edge cases (empty lines, annotations)

**1.3 Create Renderer (structure → HTML)**
- Input: Structured data object
- Output: HTML for display
- Two modes:
  - Screen: Similar to current `<pre>` with `<b>` tags
  - Print: Optimized layout with column support

**1.4 Write Tests**
- Parser tests: Various input formats
- Renderer tests: Verify output correctness
- Round-trip tests: text → structure → HTML → verify alignment
- Edge case tests

### Phase 2: Migration (1 day)

**2.1 Create Migration Script**
- Read all songs from Firestore
- Parse each using new parser
- Validate structure
- Log any parsing issues

**2.2 Backup Current Data**
- Export all songs to JSON file
- Store backup in `docs/backups/` directory
- Commit to git before migration

**2.3 Migrate Songs**
- Start with one song (test)
- Verify in UI that it displays correctly
- Migrate remaining songs
- Manual review of each song

**2.4 Update Firestore Schema**
- Add new field: `sections` (structured data)
- Keep old field: `letra` (for rollback safety)
- Eventually remove `letra` after confidence period

### Phase 3: Refactor Interface (1-2 days)

**3.1 Update song.js (View/Edit Page)**
- Load structured data instead of HTML string
- Render using new renderer
- Update transposition to modify chord objects
- Update save to store structured data
- Keep edit mode simple initially (can enhance later)

**3.2 Update createSong.js (Create Page)**
- Parse input text using new parser
- Store structured data
- Show preview before saving
- Validate structure

**3.3 Update Lists (index.js, archived.js)**
- No changes needed (lists only show title/artist/tone)

**3.4 Handle Legacy Data**
- If song has `sections`: use new renderer
- If song only has `letra`: fall back to old display
- Eventually all songs will be migrated

### Phase 4: Print Optimization (0.5 day)

**4.1 Implement Two-Column Print CSS**
- Add `column-count: 2` for print media
- Ensure `break-inside: avoid` on line units
- Adjust font size if needed
- Test with various song lengths

**4.2 Print-Specific Rendering**
- May need different HTML structure for print
- Consider: title/artist at top, smaller margins
- Page breaks between songs (for future bulk print)

### Phase 5: Testing & Polish (0.5 day)

**5.1 Comprehensive Testing**
- Test all songs on desktop
- Test all songs on mobile
- Test print preview for each song
- Test transpose functionality
- Test edit/save cycle

**5.2 Edge Cases**
- Very long songs (3+ pages)
- Very short songs (< 1 page)
- Songs with unusual formatting
- Songs with many chords vs. few chords

**5.3 Performance**
- Verify Firestore queries still fast
- Check page load times
- Ensure mobile remains responsive

## Risks & Mitigation

### Risk 1: Parser Complexity
**Risk**: Parser fails to correctly identify chord vs. lyrics lines  
**Mitigation**: 
- Extensive testing with real songs from cifraclub.com
- Manual review of parsed output
- Fallback to manual correction if needed

### Risk 2: Data Loss During Migration
**Risk**: Migration script corrupts existing songs  
**Mitigation**:
- Full backup before migration
- Migrate one song at a time with manual verification
- Keep `letra` field alongside `sections` initially
- Can roll back to HTML rendering if needed

### Risk 3: Rendering Bugs
**Risk**: New renderer doesn't preserve alignment  
**Mitigation**:
- Extensive visual testing
- Compare side-by-side with current rendering
- Use monospace fonts to ensure predictability
- Round-trip tests (verify alignment programmatically)

### Risk 4: Edit Mode Complexity
**Risk**: Editing structured data is harder than editing HTML  
**Mitigation**:
- Phase 1: Keep edit mode simple (edit as text, re-parse on save)
- Phase 2: Can build structured editor later if needed
- Users are small group, can provide feedback

### Risk 5: Timeline Overrun
**Risk**: Implementation takes longer than estimated  
**Mitigation**:
- 20 days available, estimate only 3-5 days
- Large buffer for unexpected issues
- Can ship incrementally (view mode first, edit later)
- Rehearsals don't start until early January

## Success Criteria

### Must Have (MVP)
- ✅ All 8 existing songs migrated successfully
- ✅ Songs display correctly on screen (same as before)
- ✅ Transpose functionality works
- ✅ Print layout uses two columns
- ✅ Chord alignment preserved in all views
- ✅ Can create new songs from cifraclub.com text
- ✅ Can edit existing songs

### Nice to Have (Future)
- Section labels (Verse 1, Chorus, etc.)
- Structured editor UI
- Chord diagram support
- Tablature support
- Export to PDF with advanced formatting
- Bulk operations on structured data

## Technical Decisions

### Why Not Just Fix CSS?
CSS column breaks operate on text flow, not semantic units. Even with `break-inside: avoid`, there's no way to tell CSS "this chord line and this lyrics line are a semantic unit that must stay together and aligned."

### Why Not Use a Library?
Chord sheet libraries exist (e.g., ChordSheetJS), but:
- Learning curve and integration time
- May not match our specific needs
- Adds dependency and complexity
- We already have working parser logic
- Our needs are specific and simple enough

### Why Keep Edit Mode Simple Initially?
- Time constraint (MVP for carnival)
- Small user group (can provide feedback)
- Editing as text is familiar (current behavior)
- Structured editor is nice-to-have, not essential
- Can improve iteratively based on real usage

## Timeline

Assuming 8 hours/day of focused work:

- **Day 1**: Define structure, start parser (4-6 hours actual coding)
- **Day 2**: Finish parser, write tests, start renderer (6-8 hours)
- **Day 3**: Finish renderer, test round-trips (4-6 hours)
- **Day 4**: Migration script, backup, migrate songs (4-6 hours)
- **Day 5**: Refactor song.js, test thoroughly (6-8 hours)
- **Day 6**: Refactor createSong.js, test (4-6 hours)
- **Day 7**: Print CSS, comprehensive testing (4-6 hours)
- **Day 8+**: Buffer for issues, polish, additional testing

**Total estimate: 3-5 working days, with 20 days available**

## Next Steps

1. Review this document thoroughly
2. Discuss any concerns or adjustments
3. Commit this document to repo
4. Create feature branch: `refactor/structured-data`
5. Begin Phase 1: Define exact data structure
6. Implement parser with TDD approach
7. Proceed systematically through phases

---

**Document Status**: Draft  
**Last Updated**: December 15, 2025  
**Author**: Roberto + Claude  
**Related Issues**: Print layout inefficiency, chord alignment preservation
