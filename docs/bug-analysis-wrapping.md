# Análise dos Bugs de Quebra de Linha

## 🎯 Resumo Executivo

Identifiquei a causa raiz de ambos os problemas:

1. **Linhas de letra sem acordes**: ✅ **NÃO É BUG** - Funcionando conforme design
2. **Linhas com apenas acordes**: ❌ **BUG CONFIRMADO** - Não estão quebrando

---

## 🔍 Bug #1: Linha de Letra SEM Acordes

### Exemplo
```
                D7M(2)         Em7(9)
Do que a gente junto, nós dois

Mil ideias e uma história de amor    ← Esta linha não tem acordes acima
       D7M(2)          Em7(9)
E o assunto é nós dois
```

### O Que Acontece

**Resultado do parsing:**
```javascript
{
  "type": "annotation",
  "text": "Mil ideias e uma história de amor"
}
```

A linha é identificada como **annotation** (anotação/texto comum).

### Por Que Isso Acontece?

#### Módulo Suspeito: `songParser.js`

O `songParser` segue esta lógica:

```javascript
// Pseudocódigo do songParser
if (linha está vazia) {
  adiciona { type: 'empty' }
} 
else if (isChordLine(linha)) {
  // É linha de acordes
  if (próxima linha é letra) {
    cria par cifra+letra
  } else {
    cria par só com cifra (letra vazia)
  }
} 
else {
  // Não é cifra nem vazia
  adiciona { type: 'annotation', text: linha }  ← AQUI!
}
```

**Linha "Mil ideias..." passa por este caminho:**
1. `isChordLine("Mil ideias...")` retorna `false` (testado, confirmado)
2. Cai no `else` final
3. É marcada como `annotation`

### Como É Renderizado?

#### Módulo Suspeito: `songRenderer.js`

```javascript
// Trecho relevante do songRenderer
if (item.type === 'annotation') {
  renderedLines.push(item.text);  ← Adiciona texto PURO, sem quebra
}
```

**Annotations NÃO passam por `wrapLine()`!**

Elas são retornadas **exatamente como estão**, sem processamento.

### É Realmente um Bug?

**Resposta: DEPENDE da perspectiva**

**Argumento "não é bug":**
- Tecnicamente, a linha "Mil ideias..." não tem acordes
- No formato tradicional de cifras, seria mesmo uma anotação
- O sistema está se comportando exatamente como foi projetado

**Argumento "é bug de UX":**
- Do ponto de vista do **usuário**, é apenas a continuação da letra
- Deveria quebrar junto com as outras linhas
- Causa inconsistência visual: algumas linhas quebram, outras não

### Solução Proposta

**Opção 1: Quebrar annotations longas**

Modificar `songRenderer.js`:
```javascript
if (item.type === 'annotation') {
  // Em vez de apenas: renderedLines.push(item.text);
  
  // Aplicar quebra manual se exceder maxWidth
  if (item.text.length > maxWidth) {
    const words = item.text.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length > maxWidth) {
        renderedLines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim()) {
      renderedLines.push(currentLine.trim());
    }
  } else {
    renderedLines.push(item.text);
  }
}
```

**Opção 2: Mudar o design** (mais complexo)

Permitir que uma linha de letra exista "órfã" (sem acordes), em vez de ser annotation.

---

## 🔍 Bug #2: Linha com APENAS Acordes

### Exemplo
```
[Final] G7M  D7M(2)  G7M  D7M(2)
```

### O Que Acontece

**Resultado do parsing:**
```javascript
{
  "chords": [
    { "position": 0, "chord": "[Final]" },
    { "position": 8, "chord": "G7M" },
    { "position": 13, "chord": "D7M(2)" },
    { "position": 21, "chord": "G7M" },
    { "position": 26, "chord": "D7M(2)" }
  ],
  "lyrics": ""  ← String vazia!
}
```

**Renderização (com maxWidth=15):**
```
<b>G7M</b>  <b>D7M(2)</b>  <b>G7M</b>  <b>D7M(2)</b>
```

**Resultado:** Linha NÃO quebra, mesmo sendo muito longa!

### Por Que Isso Acontece?

#### Módulo Suspeito: `lineWrapper.js`

Vamos seguir o código passo a passo:

```javascript
export function wrapLine(lineData, maxWidth) {
  const { chords, lyrics } = lineData;
  
  // 1. Calcular comprimento da letra
  const lyricsLength = lyrics.length;  // = 0 (string vazia!)
  
  // 2. Calcular comprimento da linha de acordes
  let chordLineLength = 0;
  if (chords.length > 0) {
    const lastChord = chords[chords.length - 1];
    chordLineLength = lastChord.position + lastChord.chord.length;
    // = 26 + 7 = 33 caracteres
  }
  
  // 3. Pegar o MAIOR dos dois
  const maxLineLength = Math.max(lyricsLength, chordLineLength);
  // = Math.max(0, 33) = 33
  
  // 4. Verificar se precisa quebrar
  if (maxLineLength <= maxWidth) {  // 33 <= 15? NÃO
    return [lineData];  // Mas... não retorna aqui!
  }
  
  // 5. Procurar ponto de quebra
  let breakPoint = -1;
  for (let i = maxWidth; i >= 0; i--) {
    if (lyrics[i] === ' ') {  // ← PROBLEMA AQUI!
      // ...
    }
  }
  
  // 6. Se não encontrou espaço
  if (breakPoint === -1) {
    return [lineData];  // ← RETORNA AQUI SEM QUEBRAR!
  }
}
```

**O problema:**

Quando `lyrics = ""` (string vazia):
- Não há NENHUM espaço para servir como ponto de quebra
- O loop `for (let i = maxWidth; i >= 0; i--)` nunca encontra `lyrics[i] === ' '`
- `breakPoint` permanece `-1`
- Função retorna a linha original **sem quebrar**

### Diagnóstico

**Comportamento atual:**
```
lineWrapper só sabe quebrar olhando para ESPAÇOS NA LETRA
     ↓
Se não há letra, não há espaços
     ↓
Não quebra
```

### Solução Proposta

Modificar `lineWrapper.js` para detectar este caso especial:

```javascript
export function wrapLine(lineData, maxWidth) {
  const { chords, lyrics } = lineData;
  
  // ... código existente ...
  
  // Se linha excede maxWidth mas não tem letra (só acordes)
  if (maxLineLength > maxWidth && lyrics.trim() === '') {
    // Estratégia: quebrar entre acordes
    return wrapChordOnlyLine(chords, maxWidth);
  }
  
  // ... resto do código ...
}

function wrapChordOnlyLine(chords, maxWidth) {
  const lines = [];
  let currentLineChords = [];
  let currentLineLength = 0;
  
  for (const { position, chord } of chords) {
    const chordLength = chord.length;
    
    // Estimar posição nesta linha (relativa)
    const positionInCurrentLine = currentLineChords.length > 0 
      ? currentLineChords[currentLineChords.length - 1].position + 
        currentLineChords[currentLineChords.length - 1].chord.length + 2 
      : 0;
    
    // Se adicionar este acorde excederia maxWidth
    if (positionInCurrentLine + chordLength > maxWidth && currentLineChords.length > 0) {
      // Finaliza linha atual
      lines.push({ chords: currentLineChords, lyrics: '' });
      
      // Começa nova linha
      currentLineChords = [{ position: 0, chord }];
    } else {
      // Adiciona à linha atual
      currentLineChords.push({ 
        position: positionInCurrentLine, 
        chord 
      });
    }
  }
  
  // Não esquecer última linha
  if (currentLineChords.length > 0) {
    lines.push({ chords: currentLineChords, lyrics: '' });
  }
  
  return lines;
}
```

---

## 📊 Resumo: Módulos Suspeitos

| Bug | Módulo Principal | Módulo Secundário | Causa Raiz |
|-----|-----------------|-------------------|------------|
| Letra sem acordes | `songRenderer.js` | `songParser.js` | Annotations não passam por wrapLine |
| Só acordes | `lineWrapper.js` | - | Algoritmo assume que sempre há letra para buscar espaços |

---

## 🎯 Prioridade de Correção

### Bug #2 (Só acordes): **ALTA**
- Comportamento claramente incorreto
- Solução técnica bem definida
- Não requer mudança de design

### Bug #1 (Letra sem acordes): **MÉDIA**
- Depende da interpretação (é feature ou bug?)
- Solução simples (quebrar annotations)
- Alternativa: aceitar como comportamento atual

---

## 🧪 Como Testar Suas Hipóteses

Criei o arquivo `bugInvestigation.test.js` que você pode usar para:

1. **Ver exatamente** como cada linha é parseada
2. **Confirmar** se é annotation ou linePair
3. **Verificar** se a quebra é aplicada ou não

**Para rodar:**
```bash
npm run test:run -- bugInvestigation.test.js
```

Os `console.log` mostram a estrutura de dados em cada etapa.

---

## 💡 Próximos Passos Sugeridos

1. **Decidir** se bug #1 precisa ser corrigido (questão de UX)
2. **Implementar** correção para bug #2 (linha só com acordes)
3. **Testar** com a música real do banco de dados
4. **Validar** que não quebrou nenhum teste existente
