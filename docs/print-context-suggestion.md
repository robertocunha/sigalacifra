# Adição Sugerida para CLAUDE.md - Contexto de Impressão

Adicionar após a linha "⚠️ Print layout inefficient..." na seção "What's Missing / Broken":

---

### Print Layout - Additional Context

**Current state:**
- Single-column layout for screen viewing (works well)
- `print.css` hides navigation, shows only: title, artist, tone, lyrics with chords
- One song typically spans 4-5 printed pages (wasteful)
- Print button (🖨️) triggers browser's native print dialog

**Desired state:**
- **Two-column layout for print media** (like traditional songbooks)
- Target: 1 song fits in 1-2 pages max
- Must preserve chord-syllable alignment (critical!)
- Should work with the existing line wrapping system

**Technical foundation (already implemented):**
- Songs are parsed into `linePairs` array (via `parseSong()`)
- Each `linePair` contains structured chords + lyrics
- Line wrapping respects `maxWidth` and doesn't split chords
- Rendering generates HTML with `<b>` tags for chords

**Key challenge:**
How to split `linePairs` array into two balanced columns for print, while:
1. Maintaining visual flow (users read top→bottom, left column→right column)
2. Keeping chord alignment intact
3. Avoiding awkward breaks (e.g., splitting a verse across columns)

**Files to review:**
- `src/css/print.css` - Current print styles (single column)
- `src/scripts/songRenderer.js` - Renders song from linePairs
- `src/scripts/song.js` - Main song page logic (has cached `linePairs`)

**Inspiration:**
Traditional printed songbooks use two columns to fit 2-3 songs per A4 page. We want similar density for single-song view.

---

**Por que isso ajuda:**

1. **Contexto imediato** - Claude não precisa procurar informações espalhadas
2. **Direção clara** - Já sabe qual é o objetivo técnico
3. **Conexão com código existente** - Entende que pode reutilizar `linePairs`
4. **Evita suposições** - Fica claro que wrapping JÁ funciona, só precisa de layout de impressão

**Alternativa mais rápida:**

Se quiser algo ainda mais direto, pode simplesmente colar isto no **início do novo chat**:

```
Olá! Quero implementar layout de duas colunas para impressão.

Contexto:
- Projeto: sigalacifra (app de cifras para bloco de carnaval)
- Problema: músicas ocupam 4-5 páginas ao imprimir (desperdício)
- Objetivo: duas colunas na impressão (como songbooks tradicionais) → 1-2 páginas/música
- Já temos: sistema de parsing/wrapping que gera array de linePairs
- Desafio: dividir linePairs em 2 colunas balanceadas sem quebrar alinhamento de acordes

Por favor, leia CLAUDE.md para contexto completo do projeto.
Depois me diga sua estratégia de implementação.
```

Isso + `CLAUDE.md` seria **perfeito** para começar!

O que você acha? Quer que eu adicione essa seção ao `CLAUDE.md` agora ou prefere fazer manualmente?
