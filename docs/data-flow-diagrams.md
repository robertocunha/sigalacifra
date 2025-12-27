# Fluxo de Dados: Do Texto ao HTML Renderizado

## 📋 Visão Geral

Este documento mostra visualmente como cada tipo de linha percorre o sistema.

---

## 🎵 Caso Normal: Linha com Acordes + Letra

```
┌─────────────────────────────────────────────────────┐
│ INPUT (texto do Firestore)                          │
│ "    D7M(2)         Em7(9)                          │
│  Do que a gente junto, nós dois"                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songParser.js                                       │
│                                                     │
│ 1. Split por \n                                     │
│ 2. linha[0] = "    D7M(2)         Em7(9)"           │
│    linha[1] = " Do que a gente junto, nós dois"     │
│                                                     │
│ 3. isChordLine(linha[0])? → TRUE ✓                  │
│                                                     │
│ 4. Próxima linha é letra? → TRUE ✓                  │
│                                                     │
│ 5. Chama parseLine(linha[0], linha[1])              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineParser.js                                       │
│                                                     │
│ Identifica posições dos acordes:                   │
│   - D7M(2) na posição 4                             │
│   - Em7(9) na posição 20                            │
│                                                     │
│ Retorna:                                            │
│ {                                                   │
│   chords: [                                         │
│     {position: 4, chord: "D7M(2)"},                 │
│     {position: 20, chord: "Em7(9)"}                 │
│   ],                                                │
│   lyrics: " Do que a gente junto, nós dois"         │
│ }                                                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songRenderer.js                                     │
│                                                     │
│ Para cada linePair:                                 │
│   1. Chama wrapLine(linePair, maxWidth)             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineWrapper.js                                      │
│                                                     │
│ 1. lyrics.length = 33 chars                         │
│ 2. chordLineLength = 20 + 6 = 26 chars              │
│ 3. maxLineLength = max(33, 26) = 33                 │
│                                                     │
│ 4. 33 > maxWidth(20)? → SIM, precisa quebrar        │
│                                                     │
│ 5. Procura último espaço antes de posição 20:       │
│    "Do que a gente junto, nós dois"                 │
│     ^         ^      ^                              │
│     pos 4     pos 11 pos 18 ← ESTE!                 │
│                                                     │
│ 6. Verifica se cortaria acorde: NÃO ✓               │
│                                                     │
│ 7. Quebra na posição 19 (após "junto,"):            │
│    Parte 1: " Do que a gente junto, "               │
│    Parte 2: "nós dois"                              │
│                                                     │
│ 8. Redistribui acordes:                             │
│    Parte 1: D7M(2) [pos 4]                          │
│    Parte 2: Em7(9) [pos 20-19 = 1]                  │
│                                                     │
│ Retorna: [linePair1, linePair2]                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songRenderer.js (continuação)                       │
│                                                     │
│ Para cada linha quebrada:                           │
│   2. Chama renderLine(linha, html=true)             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineRenderer.js                                     │
│                                                     │
│ Gera HTML com tags <b>:                             │
│                                                     │
│ Linha 1:                                            │
│ "    <b>D7M(2)</b>                                  │
│  Do que a gente junto, "                            │
│                                                     │
│ Linha 2:                                            │
│ " <b>Em7(9)</b>                                     │
│  nós dois"                                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ OUTPUT (inserido no DOM via innerHTML)              │
│                                                     │
│ <pre>                                               │
│     <b>D7M(2)</b>                                   │
│  Do que a gente junto,                              │
│  <b>Em7(9)</b>                                      │
│  nós dois                                           │
│ </pre>                                              │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Bug #1: Linha SEM Acordes (Letra Órfã)

```
┌─────────────────────────────────────────────────────┐
│ INPUT                                               │
│ "Mil ideias e uma história de amor"                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songParser.js                                       │
│                                                     │
│ 1. isChordLine(linha)? → FALSE ✗                    │
│                                                     │
│ 2. Não é vazia → cai no else                        │
│                                                     │
│ 3. Marca como ANNOTATION:                           │
│    {                                                │
│      type: 'annotation',                            │
│      text: "Mil ideias e uma história de amor"      │
│    }                                                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songRenderer.js                                     │
│                                                     │
│ Detecta item.type === 'annotation'                  │
│                                                     │
│ NÃO chama wrapLine() ← AQUI ESTÁ O PROBLEMA!        │
│                                                     │
│ Apenas: renderedLines.push(item.text)               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ OUTPUT (texto puro, sem quebra)                     │
│                                                     │
│ "Mil ideias e uma história de amor"                │
│                                                     │
│ → Linha LONGA permanece inteira                     │
│ → Causa scroll horizontal                           │
└─────────────────────────────────────────────────────┘
```

**Módulos envolvidos:**
1. ❌ `songParser.js` - Classifica como annotation
2. ❌ `songRenderer.js` - Pula o wrapLine para annotations

---

## 🐛 Bug #2: Linha com APENAS Acordes

```
┌─────────────────────────────────────────────────────┐
│ INPUT                                               │
│ "G7M  D7M(2)  G7M  D7M(2)"                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songParser.js                                       │
│                                                     │
│ 1. isChordLine(linha)? → TRUE ✓                     │
│                                                     │
│ 2. Próxima linha é letra? → FALSE/NÃO EXISTE        │
│                                                     │
│ 3. Chama parseLine(linha, "") ← letra VAZIA         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineParser.js                                       │
│                                                     │
│ Retorna:                                            │
│ {                                                   │
│   chords: [                                         │
│     {position: 0, chord: "G7M"},                    │
│     {position: 5, chord: "D7M(2)"},                 │
│     {position: 13, chord: "G7M"},                   │
│     {position: 18, chord: "D7M(2)"}                 │
│   ],                                                │
│   lyrics: ""  ← STRING VAZIA!                       │
│ }                                                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ songRenderer.js                                     │
│                                                     │
│ Chama wrapLine(linePair, maxWidth)                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineWrapper.js                                      │
│                                                     │
│ 1. lyrics.length = 0  ← VAZIO!                      │
│ 2. chordLineLength = 18 + 7 = 25 chars              │
│ 3. maxLineLength = max(0, 25) = 25                  │
│                                                     │
│ 4. 25 > maxWidth(15)? → SIM, precisa quebrar        │
│                                                     │
│ 5. Procura espaço em lyrics:                        │
│    for (let i = 15; i >= 0; i--) {                  │
│      if (lyrics[i] === ' ') {  ← NUNCA ACHA!        │
│        // lyrics = "" não tem índice [i]            │
│      }                                              │
│    }                                                │
│                                                     │
│ 6. breakPoint permanece -1                          │
│                                                     │
│ 7. Retorna: return [lineData]  ← SEM QUEBRAR!       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ lineRenderer.js                                     │
│                                                     │
│ Renderiza linha INTEIRA (não quebrada)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ OUTPUT (linha longa, sem quebra)                    │
│                                                     │
│ "<b>G7M</b>  <b>D7M(2)</b>  <b>G7M</b>  <b>D7M(2)</b>"│
│                                                     │
│ → Linha excede maxWidth                             │
│ → Causa scroll horizontal                           │
└─────────────────────────────────────────────────────┘
```

**Módulo culpado:**
1. ❌ `lineWrapper.js` - Algoritmo assume que sempre há letra com espaços

---

## 🎯 Comparação: Normal vs. Bugs

| Tipo de Linha | songParser | lineWrapper | Resultado |
|--------------|-----------|-------------|-----------|
| **Normal** (acordes + letra) | linePair ✓ | Quebra nos espaços da letra ✓ | ✅ FUNCIONA |
| **Bug #1** (só letra) | annotation ✗ | NÃO É CHAMADO ✗ | ❌ NÃO QUEBRA |
| **Bug #2** (só acordes) | linePair ✓ | Não acha espaços ✗ | ❌ NÃO QUEBRA |

---

## 💡 Insights Importantes

### 1. Design Atual Assume Par Cifra+Letra

O sistema foi desenhado pensando que **sempre** teremos:
- Linha de acordes
- Linha de letra (com espaços para quebrar)

**Casos edge não previstos:**
- Letra sem acordes → vira annotation
- Acordes sem letra → letra vazia, sem espaços

### 2. lineWrapper Depende de Espaços na Letra

```javascript
// Código atual procura espaços APENAS na letra
for (let i = maxWidth; i >= 0; i--) {
  if (lyrics[i] === ' ') {  // ← Estratégia única
    // quebra aqui
  }
}
```

Se `lyrics = ""`, este loop nunca encontra ponto de quebra.

### 3. Annotations são "Cidadãos de Segunda Classe"

```javascript
// songRenderer.js
if (item.type === 'annotation') {
  renderedLines.push(item.text);  // Sem processamento
}
```

Não recebem:
- ❌ Quebra de linha
- ❌ Formatação
- ❌ Qualquer tipo de transformação

---

## 🔧 Sugestões de Correção

### Para Bug #1 (Letra sem acordes)

**Abordagem A:** Quebrar annotations longas no renderer
```javascript
// Em songRenderer.js
if (item.type === 'annotation') {
  if (item.text.length > maxWidth) {
    // Aplicar quebra simples por palavras
    const wrapped = simpleWordWrap(item.text, maxWidth);
    renderedLines.push(...wrapped);
  } else {
    renderedLines.push(item.text);
  }
}
```

**Abordagem B:** Permitir linePair sem acordes
```javascript
// Em songParser.js - mudar lógica
// Permitir { chords: [], lyrics: "texto" }
```

### Para Bug #2 (Só acordes)

**Abordagem:** Detectar caso especial no wrapper
```javascript
// Em lineWrapper.js, ANTES do loop de procura de espaços
if (lyrics.trim() === '' && chords.length > 0) {
  // Usar algoritmo alternativo: quebrar entre acordes
  return wrapChordOnlyLine(chords, maxWidth);
}
```

---

## 📚 Arquivos para Estudar

Se quiser se aprofundar, foque nestes arquivos na ordem:

1. **songParser.js** - Entenda como linhas são classificadas
2. **lineWrapper.js** - Veja onde a quebra falha
3. **songRenderer.js** - Observe o tratamento diferente de annotations
4. **bugInvestigation.test.js** - Execute e veja os logs

**Comando:**
```bash
npm run test:run -- bugInvestigation.test.js
```
