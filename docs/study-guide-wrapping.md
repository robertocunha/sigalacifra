# Guia de Estudo: Entendendo a Quebra de Linhas

Este guia foi criado especificamente para te ajudar a **aprofundar sua compreensão** do código relacionado à quebra de linhas, com foco nos bugs identificados.

---

## 🎯 Objetivo do Estudo

Você quer entender:
1. Como funciona a quebra de linhas (visão geral)
2. Por que linhas sem acordes não quebram
3. Por que linhas só com acordes não quebram
4. Quais módulos são "suspeitos" em cada caso

---

## 📖 Roteiro de Estudo Sugerido

### Fase 1: Visão Macro (30 min)

**Leia nesta ordem:**

1. ✅ **`CLAUDE.md`** (seção "Current Work")
   - Te dá o contexto do que foi feito
   - Explica o problema que a refatoração resolve

2. ✅ **`docs/data-flow-diagrams.md`** (que acabei de criar)
   - Mostra VISUALMENTE o fluxo de dados
   - Compare "Caso Normal" vs "Bug #1" vs "Bug #2"
   - Veja onde cada tipo de linha "descarrilha"

3. ✅ **`docs/bug-analysis-wrapping.md`** (que acabei de criar)
   - Análise detalhada de cada bug
   - Identifica módulos suspeitos
   - Propõe soluções

**Atividade prática:**
```bash
# Execute os testes de investigação
cd /home/roberto/Documents/estudos/projetos/editorCifras/sigalacifra
npm run test:run -- bugInvestigation.test.js
```

Leia os `console.log` e compare com os diagramas.

---

### Fase 2: Mergulho no Código (1-2 horas)

Agora que você tem a visão geral, vamos **ler o código fonte** com olhar crítico.

#### 2.1. Entender a Classificação de Linhas

**Arquivo:** `src/scripts/songParser.js`

**Perguntas para responder enquanto lê:**

1. Como o parser decide se uma linha é `chord line` ou `annotation`?
2. O que acontece quando uma linha de acordes NÃO tem letra depois?
3. O que acontece quando uma linha NÃO é detectada como acordes?

**Experimento:**
```javascript
// Abra o Node.js no terminal
node

// Importe os módulos
const { isChordLine } = await import('./src/scripts/chordParser.js');

// Teste casos específicos
isChordLine("Mil ideias e uma história de amor");  // false
isChordLine("[Final] G7M  D7M(2)");                // true
isChordLine("G7M  D7M(2)");                        // true

// Entenda: por que "Mil ideias" retorna false?
// Resposta: Menos de 50% das palavras são acordes
```

**Foque nestas linhas:**
- Linha 22: `if (isChordLine(currentLine))`
- Linha 35-40: Decisão entre linePair com ou sem letra
- Linha 42-45: Caso `else` que cria annotation

---

#### 2.2. Entender o Algoritmo de Quebra

**Arquivo:** `src/scripts/lineWrapper.js`

**Perguntas para responder:**

1. Como o wrapper decide SE precisa quebrar?
2. Como ele ENCONTRA o ponto de quebra?
3. O que acontece quando `lyrics = ""`?

**Trace mental do código:**

Imagine esta entrada:
```javascript
lineData = {
  chords: [
    {position: 0, chord: "G7M"},
    {position: 5, chord: "D7M(2)"}
  ],
  lyrics: ""  // ← VAZIO!
}
maxWidth = 15
```

**Siga o código linha por linha:**

```javascript
// Linha 8-9: Calcular comprimentos
const lyricsLength = lyrics.length;  // = 0
let chordLineLength = 0;

// Linha 11-14: Pegar posição do último acorde
const lastChord = chords[1];  // D7M(2)
chordLineLength = 5 + 7 = 12

// Linha 17: Pegar maior
const maxLineLength = Math.max(0, 12) = 12

// Linha 20: Verificar se cabe
if (12 <= 15) {  // TRUE!
  return [lineData];  // RETORNA AQUI!
}
```

**Espera! O teste mostrou que linha NÃO quebrava, mas este trace mostra que ela CABE em 15 chars!**

**Refaça com valores reais:**
```javascript
// Linha real do teste:
// "G7M  D7M(2)  G7M  D7M(2)"
//  0123456789...

chords = [
  {position: 0, chord: "G7M"},      // termina em 3
  {position: 5, chord: "D7M(2)"},   // termina em 12
  {position: 13, chord: "G7M"},     // termina em 16
  {position: 18, chord: "D7M(2)"}   // termina em 25
]

// Último acorde
lastChord = {position: 18, chord: "D7M(2)"}
chordLineLength = 18 + 7 = 25  // AGORA SIM!

maxLineLength = max(0, 25) = 25

if (25 <= 15) {  // FALSE
  // Não retorna aqui, continua...
}
```

**Continue o trace:**

```javascript
// Linha 23-26: Procurar ponto de quebra
let breakPoint = -1;
for (let i = 15; i >= 0; i--) {
  if (lyrics[i] === ' ') {  // lyrics[15] = undefined!
    // NUNCA entra aqui
  }
}

// Linha 68: breakPoint ainda é -1
if (breakPoint === -1) {
  return [lineData];  // RETORNA SEM QUEBRAR! ← BUG!
}
```

**Agora você entendeu o bug!**

---

#### 2.3. Entender o Renderizador

**Arquivo:** `src/scripts/songRenderer.js`

**Perguntas:**

1. Como o renderer trata `annotations` diferente de `linePairs`?
2. Qual a consequência disso para linhas longas?

**Foque nestas linhas:**
- Linha 11-13: Tratamento de `empty`
- Linha 14-16: Tratamento de `annotation` ← SEM wrapLine!
- Linha 17-26: Tratamento de linePair ← COM wrapLine!

---

### Fase 3: Experimentos Práticos (1 hora)

Agora que você entendeu o código, vamos **experimentar**!

#### Experimento 1: Adicionar Logs

Modifique `lineWrapper.js` temporariamente:

```javascript
export function wrapLine(lineData, maxWidth) {
  const { chords, lyrics } = lineData;
  
  console.log('=== wrapLine chamado ===');
  console.log('lyrics:', JSON.stringify(lyrics));
  console.log('chords:', chords.length);
  console.log('maxWidth:', maxWidth);
  
  // ... resto do código
  
  if (breakPoint === -1) {
    console.log('⚠️  Não encontrou ponto de quebra!');
    console.log('   Motivo: lyrics vazio ou sem espaços');
    return [lineData];
  }
}
```

Execute os testes novamente e veja os logs.

#### Experimento 2: Forçar Quebra

Tente implementar uma versão simples da correção:

```javascript
// Em lineWrapper.js, ANTES do loop de procura de espaços

// EXPERIMENTO: Detectar linha só com acordes
if (lyrics.trim() === '' && chords.length > 1) {
  console.log('🔧 Detectado: linha só com acordes!');
  console.log('   Aplicando quebra especial...');
  
  // Estratégia simplificada: quebrar no meio
  const mid = Math.floor(chords.length / 2);
  const firstChords = chords.slice(0, mid);
  const secondChords = chords.slice(mid);
  
  return [
    { chords: firstChords, lyrics: '' },
    { chords: secondChords, lyrics: '' }
  ];
}
```

Execute os testes e veja se a quebra funciona!

#### Experimento 3: Quebrar Annotations

Adicione uma função simples em `songRenderer.js`:

```javascript
function simpleWordWrap(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > maxWidth && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
}

// Depois, no if (item.type === 'annotation'):
if (item.type === 'annotation') {
  if (item.text.length > maxWidth) {
    const wrapped = simpleWordWrap(item.text, maxWidth);
    renderedLines.push(...wrapped);
  } else {
    renderedLines.push(item.text);
  }
}
```

Teste e veja se annotations agora quebram!

---

### Fase 4: Consolidação (30 min)

**Documente seu aprendizado:**

Crie um arquivo pessoal (não precisa commitar) chamado `meus-aprendizados.md` e escreva:

1. **Resumo do fluxo de dados** (em suas próprias palavras)
2. **Causa raiz de cada bug** (explicação técnica)
3. **Módulos responsáveis** (e por quê)
4. **Ideias de solução** (pode ser diferente das minhas!)

**Exemplo:**
```markdown
# Meus Aprendizados

## Como funciona a quebra de linhas

1. songParser pega texto e divide em estrutura
2. Cada "coisa" pode ser: empty, annotation, ou linePair
3. lineWrapper só é chamado para linePairs
4. ...

## Bug: Linha sem acordes

- Classificada como annotation no songParser
- songRenderer não chama wrapLine para annotations
- Solução: Adicionar quebra simples por palavras

## Código que vou propor

...
```

---

## 🎓 Conceitos-Chave para Entender

### 1. Fluxo de Dados Unidirecional

```
Texto → Estrutura → Quebra → Renderização → HTML
```

Cada etapa é **independente**. Isso facilita debugging!

### 2. Tipos de Objetos no Sistema

```javascript
// linePair (normal)
{
  chords: [{position, chord}, ...],
  lyrics: "string"
}

// annotation (texto sem acordes)
{
  type: 'annotation',
  text: "string"
}

// empty (linha vazia)
{
  type: 'empty'
}
```

### 3. Responsabilidade de Cada Módulo

| Módulo | O que FAZ | O que NÃO faz |
|--------|-----------|---------------|
| songParser | Classifica linhas | Não quebra nada |
| lineWrapper | Quebra linePairs | Não toca annotations |
| songRenderer | Coordena | Não faz lógica complexa |

---

## 🔍 Checklist de Compreensão

Ao final do estudo, você deve conseguir responder:

- [ ] Por que `isChordLine("Mil ideias...")` retorna `false`?
- [ ] O que acontece com uma linha classificada como `annotation`?
- [ ] Por que `lineWrapper` não consegue quebrar linha sem letra?
- [ ] Onde no código está a decisão "precisa quebrar ou não"?
- [ ] Como o algoritmo encontra o ponto de quebra?
- [ ] O que significa `breakPoint = -1`?
- [ ] Por que acordes precisam ter posições recalculadas após quebra?
- [ ] Qual a diferença entre `renderLine(data, true)` e `renderLine(data, false)`?

---

## 💬 Perguntas para Reflexão

Depois de estudar, pense:

1. **Design:** O sistema atual assumiu que tipo de casos de uso?
2. **Edge cases:** Que outros casos edge podem existir além desses dois?
3. **Trade-offs:** As soluções propostas têm algum custo/limitação?
4. **Testes:** Que testes adicionais você escreveria?

---

## 📚 Recursos Criados

Documentos que podem te ajudar:

1. **`bug-analysis-wrapping.md`** - Análise técnica detalhada
2. **`data-flow-diagrams.md`** - Diagramas visuais do fluxo
3. **`bugInvestigation.test.js`** - Testes com console.log
4. **`analysis2025December.md`** - Arquitetura geral do sistema

---

## 🚀 Próximos Passos

Depois de entender os bugs:

1. **Decidir** se quer corrigir agora ou estudar mais
2. **Escrever testes** que falham (test-driven)
3. **Implementar correções** incrementalmente
4. **Validar** com a música real do banco

Boa sorte! 🎵
