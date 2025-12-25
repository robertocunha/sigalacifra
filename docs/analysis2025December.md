# Análise da Base de Código - Dezembro 2025

## Visão Geral do Projeto

Este documento analisa a arquitetura do sistema de **quebra inteligente de linhas** para cifras musicais, desenvolvido para resolver o problema de scroll horizontal em dispositivos móveis.

---

## 🎯 Visão Macro: O Fluxo Completo

### Resumo
Entrada (texto) -> songParser -> songRenderer -> Saída (HTML)

<details>
<summary><strong>Diagrama do Fluxo de Dados</strong></summary>

```
ENTRADA (texto plano)          PROCESSAMENTO                    SAÍDA (HTML)
─────────────────────          ──────────────                   ────────────

"C       Dm7                   1. songParser                    <pre>
 Marcha soldado"           ──────────────►                      <b>C</b>   <b>Dm7</b>
                                Separa cifras                    Marcha soldado
                                de letras                        </pre>
                                     │
                                     ▼
                              {                                 (renderizado
                                chords: [                        com quebras
                                  {pos:0, chord:"C"},            inteligentes)
                                  {pos:7, chord:"Dm7"}
                                ],
                                lyrics: " Marcha soldado"
                              }
                                     │
                                     ▼
                           2. lineWrapper
                         ────────────────►
                           Quebra linha longa
                           em pedaços menores
                                     │
                                     ▼
                              [
                                {chords:[...], lyrics:"..."},
                                {chords:[...], lyrics:"..."}
                              ]
                                     │
                                     ▼
                           3. songRenderer
                         ────────────────►
                           Converte estrutura
                           de volta para HTML
```

</details>

---

## 📦 Módulos e Suas Responsabilidades

A arquitetura foi dividida em **5 módulos** com responsabilidades bem definidas, seguindo o princípio da responsabilidade única.

### Hierarquia dos Módulos

<details>
<summary><strong>Estrutura em Camadas</strong></summary>

```
Nível baixo (primitivos):
  - lineParser   ← Trabalha com 1 par cifra+letra
  - lineRenderer ← Trabalha com 1 par cifra+letra
  - lineWrapper  ← Trabalha com 1 par cifra+letra

Nível alto (coordenadores):
  - songParser   ← Trabalha com N pares
  - songRenderer ← Trabalha com N pares
```

**Vantagens dessa arquitetura:**
1. **Responsabilidade única:** Cada módulo faz UMA coisa bem feita
2. **Testabilidade:** É possível testar quebra de linha sem se preocupar com parsing
3. **Reusabilidade:** `lineParser` e `lineRenderer` podem ser usados isoladamente
4. **Composição:** `songParser` e `songRenderer` apenas COORDENAM os módulos menores

</details>

---

## 1️⃣ lineParser.js

**Missão:** Transformar duas linhas de texto (cifras + letra) em dados estruturados.

<details>
<summary><strong>Exemplo de Funcionamento</strong></summary>

**Input:**
```javascript
chordLine:  "C       Dm7    "
lyricsLine: " Marcha soldado"
```

**Output:**
```javascript
{
  chords: [
    { position: 0, chord: "C" },
    { position: 8, chord: "Dm7" }
  ],
  lyrics: " Marcha soldado"
}
```

**Analogia:** É como um "scanner" que identifica onde cada cifra está posicionada em relação às sílabas.

</details>

<details>
<summary><strong>Algoritmo Detalhado</strong></summary>

```javascript
export function parseLine(chordLine, lyricsLine) {
  const chords = [];
  
  // Loop pelos caracteres da linha de cifras
  let position = 0;
  let currentChord = '';
  
  for (let i = 0; i < chordLine.length; i++) {
    const char = chordLine[i];
    
    if (char !== ' ') {
      // Construindo uma cifra
      if (currentChord === '') {
        position = i; // Início da cifra
      }
      currentChord += char;
    } else {
      // Espaço encontrado - fim da cifra (se estávamos construindo uma)
      if (currentChord !== '') {
        chords.push({ position, chord: currentChord });
        currentChord = '';
      }
    }
  }
  
  // Última cifra (se linha não termina com espaço)
  if (currentChord !== '') {
    chords.push({ position, chord: currentChord });
  }
  
  return { chords, lyrics: lyricsLine };
}
```

**Passos:**
1. Percorre caractere por caractere da linha de cifras
2. Identifica sequências de caracteres não-espaço como acordes
3. Registra posição inicial e texto de cada acorde
4. Retorna estrutura com array de acordes e string de letras

</details>

---

## 2️⃣ lineRenderer.js

**Missão:** Converter dados estruturados de volta para texto (com ou sem HTML).

<details>
<summary><strong>Exemplo de Funcionamento</strong></summary>

**Input:**
```javascript
{
  chords: [{ position: 0, chord: "C" }],
  lyrics: " Marcha"
}
```

**Output (texto plano):**
```
"C      \n Marcha"
```

**Output (HTML):**
```
"<b>C</b>      \n Marcha"
```

**Analogia:** É a "impressora" que formata a estrutura de volta para visualização.

</details>

<details>
<summary><strong>Algoritmo para Modo HTML</strong></summary>

```javascript
export function renderLine(lineData, html = false) {
  const { chords, lyrics } = lineData;
  
  if (html) {
    // Modo HTML: cifras com tags <b>
    let chordLine = '';
    let currentPos = 0;
    
    for (const { position, chord } of chords) {
      // Adiciona espaços antes desta cifra
      chordLine += ' '.repeat(position - currentPos);
      // Adiciona cifra envolvida em <b>
      chordLine += `<b>${chord}</b>`;
      currentPos = position + chord.length;
    }
    
    // Preenche espaços restantes para igualar comprimento da letra
    if (currentPos < lyrics.length) {
      chordLine += ' '.repeat(lyrics.length - currentPos);
    }
    
    return chordLine + '\n' + lyrics;
  } else {
    // Modo texto plano
    const chordLineArray = new Array(lyrics.length).fill(' ');
    
    // Coloca cada cifra na sua posição
    for (const { position, chord } of chords) {
      for (let i = 0; i < chord.length; i++) {
        chordLineArray[position + i] = chord[i];
      }
    }
    
    const chordLine = chordLineArray.join('');
    return chordLine + '\n' + lyrics;
  }
}
```

**Detalhe importante:** Tem dois modos (`html: true/false`). O modo HTML será usado na renderização final da aplicação.

</details>

---

## 3️⃣ lineWrapper.js

**Missão:** Quebrar linhas longas em pedaços que cabem na tela, SEM cortar cifras nem palavras no meio.

<details>
<summary><strong>Exemplo de Funcionamento</strong></summary>

**Input:**
```javascript
lineData = {
  chords: [
    { position: 0, chord: "C" },
    { position: 7, chord: "Dm7" },
    { position: 15, chord: "F" }
  ],
  lyrics: "Marcha soldado cabeça"
}
maxWidth = 10
```

**Output:**
```javascript
[
  { chords: [{pos:0, chord:"C"}], lyrics: "Marcha " },
  { chords: [{pos:0, chord:"Dm7"}], lyrics: "soldado " },
  { chords: [{pos:0, chord:"F"}], lyrics: "cabeça" }
]
```

**Analogia:** É o "editor inteligente" que divide parágrafos longos em linhas, mas respeitando regras (não corta palavras, não corta cifras).

</details>

<details>
<summary><strong>Algoritmo de Quebra Inteligente</strong></summary>

**Passos principais:**

1. **Verificar se precisa quebrar:**
   - Calcula comprimento da letra
   - Calcula comprimento da linha de cifras (posição última cifra + seu tamanho)
   - Pega o MAIOR dos dois
   - Se for ≤ maxWidth → retorna linha original sem quebrar

2. **Encontrar ponto de quebra:**
   - Procura último espaço antes de maxWidth
   - Tenta quebrar APÓS o espaço (i+1)

3. **Verificar se quebraria uma cifra:**
   - Para cada cifra, verifica se ela seria cortada ao meio
   - Cifra é cortada se: `início < pontoQuebra < fim`
   - Se sim, tenta quebrar ANTES do espaço (i)

4. **Dividir letra e redistribuir cifras:**
   - Letra: divide no ponto de quebra
   - Cifras: 
     - Se termina antes do ponto → vai para primeira parte
     - Se não → vai para segunda parte com posição recalculada

5. **Recursão:**
   - Chama `wrapLine()` novamente na segunda parte
   - Continua até todas as partes caberem em maxWidth

**Fórmula de recálculo de posição:**
```javascript
novaPosicao = posicaoOriginal - pontoDeQuebra
```

</details>

<details>
<summary><strong>Caso Crítico: Não Cortar Cifra</strong></summary>

**Problema:** Se acorde "Am" está na posição 6 e tem 2 caracteres (ocupa posições 6-7), quebrar na posição 7 cortaria o acorde ao meio.

**Solução implementada:**
```javascript
// Verifica se quebra cortaria alguma cifra
let wouldSplitChord = false;
for (const { position, chord } of chords) {
  const chordEnd = position + chord.length;
  // Cifra é cortada se começa antes do ponto mas se estende além dele
  if (position < candidateBreakPoint && chordEnd > candidateBreakPoint) {
    wouldSplitChord = true;
    break;
  }
}

// Se cortaria, tenta quebrar ANTES do espaço
if (wouldSplitChord) {
  candidateBreakPoint = i; // Em vez de i+1
  // Verifica novamente...
}
```

Este foi um caso identificado durante os testes e resolvido com sucesso.

</details>

---

## 4️⃣ songParser.js

**Missão:** Processar texto de uma música inteira, identificando pares cifra+letra, linhas vazias e anotações.

<details>
<summary><strong>Exemplo de Funcionamento</strong></summary>

**Input:**
```
C       Dm7
 Marcha soldado

Cabeça de papel
```

**Output:**
```javascript
[
  {
    chords: [{pos:0, chord:"C"}, {pos:8, chord:"Dm7"}],
    lyrics: " Marcha soldado"
  },
  { type: 'empty' },
  { type: 'annotation', text: "Cabeça de papel" }
]
```

</details>

<details>
<summary><strong>Lógica de Decisão</strong></summary>

Para cada linha do texto, o parser decide:

```
┌─────────────────┐
│  Linha vazia?   │
└────────┬────────┘
         │ NÃO
         ▼
┌─────────────────┐
│ É linha de      │
│ cifra?          │
│ (isChordLine)   │
└────────┬────────┘
         │ SIM
         ▼
┌─────────────────┐
│ Próxima linha   │
│ é letra?        │
└────────┬────────┘
    SIM  │  NÃO
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌──────┐
│ Par  │  │ Só   │
│ com  │  │ cifra│
│ letra│  │      │
└──────┘  └──────┘
```

**Detalhe esperto:** Reutiliza `isChordLine()` do módulo `chordParser.js` (código antigo que já existia).

</details>

<details>
<summary><strong>Código Completo</strong></summary>

```javascript
export function parseSong(text) {
  const lines = text.split('\n');
  const linePairs = [];
  
  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i];
    
    // Preserva linhas vazias
    if (currentLine.trim() === '') {
      linePairs.push({ type: 'empty' });
      i++;
      continue;
    }
    
    // Verifica se é linha de cifra
    if (isChordLine(currentLine)) {
      const chordLine = currentLine;
      
      // Olha adiante para ver se próxima linha é letra
      const nextLine = lines[i + 1];
      let lyricsLine = '';
      let skipLines = 1; // Por padrão, pula só a linha de cifra
      
      if (nextLine && nextLine.trim() !== '' && !isChordLine(nextLine)) {
        // Próxima linha é letra
        lyricsLine = nextLine;
        skipLines = 2; // Pula cifra E letra
      }
      
      // Faz o parse do par
      const linePair = parseLine(chordLine, lyricsLine);
      linePairs.push(linePair);
      
      i += skipLines;
    } else {
      // É texto sem cifras (anotação)
      linePairs.push({ type: 'annotation', text: currentLine });
      i++;
    }
  }
  
  return linePairs;
}
```

</details>

---

## 5️⃣ songRenderer.js

**Missão:** Pegar a estrutura da música toda e transformar em HTML final, aplicando quebra de linhas quando necessário.

<details>
<summary><strong>Pipeline de Renderização</strong></summary>

Para cada item da música:

```
┌──────────────┐
│ Tipo: empty? │
└──────┬───────┘
       │ SIM → Adiciona linha vazia
       │ NÃO
       ▼
┌──────────────────┐
│ Tipo: annotation?│
└──────┬───────────┘
       │ SIM → Adiciona texto puro
       │ NÃO
       ▼
┌──────────────────┐
│ Par cifra+letra  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  wrapLine()      │ ← Quebra se necessário
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  renderLine()    │ ← Gera HTML (com <b>)
└──────┬───────────┘
       │
       ▼
    Adiciona ao
    array final
```

</details>

<details>
<summary><strong>Código Completo</strong></summary>

```javascript
export function renderSong(linePairs, maxWidth) {
  const renderedLines = [];
  
  for (const item of linePairs) {
    // Trata tipos diferentes
    if (item.type === 'empty') {
      renderedLines.push('');
    } else if (item.type === 'annotation') {
      renderedLines.push(item.text);
    } else {
      // É um par com cifras e letras
      // Aplica quebra
      const wrappedLines = wrapLine(item, maxWidth);
      
      // Renderiza cada linha quebrada
      for (const wrappedLine of wrappedLines) {
        const rendered = renderLine(wrappedLine, true); // true = HTML
        renderedLines.push(rendered);
      }
    }
  }
  
  return renderedLines.join('\n');
}
```

**Detalhe importante:** Passa `true` para `renderLine()`, então as cifras virão envolvidas em `<b>` tags.

</details>

---

## 🔄 Pipeline Completo: Do Texto ao HTML

<details>
<summary><strong>Fluxo Integrado Passo a Passo</strong></summary>

```
┌─────────────────────────────────────────────────────────────┐
│ PASSO 1: Texto original (do Firestore ou input do usuário) │
└─────────────────────────────────────────────────────────────┘
"C       Dm7
 Marcha soldado cabeça de papel"

                         │
                         ▼
         ┌───────────────────────────┐
         │   songParser.parseSong()  │
         │                           │
         │ - Divide em linhas        │
         │ - Identifica pares        │
         │ - Usa parseLine() e       │
         │   isChordLine()           │
         └───────────────────────────┘
                         │
                         ▼

┌─────────────────────────────────────────────────────────────┐
│ PASSO 2: Estrutura de dados (array de line pairs)          │
└─────────────────────────────────────────────────────────────┘
[
  {
    chords: [
      {position: 0, chord: "C"},
      {position: 8, chord: "Dm7"}
    ],
    lyrics: " Marcha soldado cabeça de papel"
  }
]

                         │
                         ▼
      ┌──────────────────────────────────┐
      │  songRenderer.renderSong()       │
      │                                  │
      │  Para cada line pair:            │
      │    1. wrapLine(maxWidth=20)      │
      │       - Quebra em 2 linhas       │
      │    2. renderLine(html=true)      │
      │       - Gera HTML com <b>        │
      └──────────────────────────────────┘
                         │
                         ▼

┌─────────────────────────────────────────────────────────────┐
│ PASSO 3: HTML final (pronto para inserir no DOM)           │
└─────────────────────────────────────────────────────────────┘
<b>C</b>       <b>Dm7</b>
 Marcha soldado cabeça
<b>F</b>
 de papel
```

</details>

---

## 🧪 Cobertura de Testes

<details>
<summary><strong>Status Atual: 64 Testes Passando</strong></summary>

### Módulos Antigos (48 testes)
- **transpose.test.js**: 26 testes
  - Transposição básica (subir/descer tom)
  - Preservação de extensões (7M, sus4, dim, aug)
  - Acordes com baixo (slash chords)
  - Equivalentes enarmônicos
  
- **chordParser.test.js**: 22 testes
  - Reconhecimento de acordes básicos (C, Am, G7)
  - Acordes complexos (G7M(9), Csus4, Cdim)
  - Edge cases: E/Em/A como palavras vs. acordes
  - Detecção de linha de cifra (>50% threshold)

### Módulos Novos (16 testes)
- **lineParser.test.js**: 3 testes
  - Parse com um acorde
  - Parse com múltiplos acordes
  - Preservação de espaços iniciais

- **lineRenderer.test.js**: 3 testes
  - Renderização com um acorde
  - Renderização com múltiplos acordes
  - Round-trip (parse → render → parse = idêntico)

- **lineWrapper.test.js**: 4 testes
  - Não quebrar linha que cabe
  - Quebrar no limite de palavra
  - Não cortar acorde ao meio (caso crítico!)
  - Quebra recursiva em múltiplas partes

- **songParser.test.js**: 4 testes
  - Parse de música simples
  - Preservação de linhas vazias
  - Detecção de anotações
  - Múltiplos pares cifra+letra

- **songRenderer.test.js**: 2 testes
  - Renderização sem quebra
  - Renderização com quebra aplicada

</details>

---

## 🐛 Observações sobre o Bug Mencionado

<details>
<summary><strong>Hipóteses Iniciais</strong></summary>

O bug apareceu após a criação de `songParser` e `songRenderer`. Possíveis causas:

### 1. Problema de CSS
- O HTML gerado tem `<b>` tags dentro de `<pre>`
- Talvez o CSS não esteja lidando bem com quebras de linha
- Possível conflito com estilos Bootstrap

### 2. Colapso de Espaços
- HTML ignora múltiplos espaços por padrão
- Se o `<pre>` não estiver configurado corretamente, os espaços podem ser colapsados
- Isso quebraria todo o alinhamento cifra↔sílaba

### 3. Integração Incompleta
- Talvez a aplicação ainda não esteja usando esses módulos corretamente
- Pode estar faltando algum passo no pipeline
- Possível incompatibilidade com código antigo

### 4. Renderização de Tags HTML
- O `renderLine(_, true)` gera `<b>` tags como strings
- Se essas strings forem inseridas como texto puro (e não como HTML), aparecerão literalmente na tela
- Precisaria usar `innerHTML` em vez de `textContent`

</details>

---

## 🎓 Conceitos-Chave para Entender o Sistema

<details>
<summary><strong>1. Significado Posicional dos Espaços</strong></summary>

Os espaços na letra **não são meramente estéticos** - eles indicam o timing exato dos acordes.

**Exemplo:**
```
G7··········C·····
····Era·uma·casa
```

- Os 4 espaços antes de "Era" → acorde G7 toca antes da voz entrar
- Os espaços entre "uma" e "casa" → acorde C toca numa pausa

**Implicação:** Cada caractere tem significado posicional. Não podemos simplesmente "limpar" espaços extras.

</details>

<details>
<summary><strong>2. Por que Estrutura de Dados?</strong></summary>

**Problema com texto plano:**
- Difícil quebrar linha preservando alinhamento
- Espaços duplos são ambíguos (parte da letra ou padding da cifra?)

**Solução com estrutura:**
```javascript
{
  chords: [{position: 0, chord: "G7"}],
  lyrics: "    Era uma casa"
}
```

Agora sabemos:
- G7 está na posição 0
- Os 4 espaços iniciais são LETRA, não padding
- Podemos recalcular posições após quebra: `novaPosicao = original - pontoDeQuebra`

</details>

<details>
<summary><strong>3. Recursão no lineWrapper</strong></summary>

**Por que recursão?**

Uma linha pode ser TÃO longa que mesmo após quebrar, a segunda parte ainda não cabe.

**Exemplo:**
```
Linha original: 60 caracteres
maxWidth: 20

Quebra 1: [20 chars] + [40 chars restantes]
          ✓ cabe      ✗ ainda não cabe!

Quebra 2: [20] + [20] + [20 chars restantes]
          ✓      ✓      ✓ agora sim!
```

**Implementação:**
```javascript
const secondPart = { chords: secondChords, lyrics: secondLyrics };

// Chama recursivamente na segunda parte
const wrappedSecondPart = wrapLine(secondPart, maxWidth);

return [firstPart, ...wrappedSecondPart];
```

</details>

---

## 📚 Relação entre Módulos Novos e Antigos

<details>
<summary><strong>Reutilização de Código Existente</strong></summary>

Os módulos novos **não reinventam a roda** - eles reutilizam código antigo:

### chordParser.js (antigo)
**Função reutilizada:** `isChordLine(line)`
- Determina se uma linha contém cifras (>50% dos caracteres)
- **Usado por:** `songParser.js`

### transpose.js (antigo)
**Função:** `transpose(chord, steps)`
- Transpõe cifras para outro tom
- **Ainda não integrado** aos módulos novos
- **Uso futuro:** Quando usuário transpor música, precisará:
  1. Parse da música → estrutura
  2. Aplicar `transpose()` em cada cifra
  3. Render de volta

### Diagrama de Dependências
```
songParser ───► isChordLine (chordParser.js)
           └──► parseLine (lineParser.js)

songRenderer ─► wrapLine (lineWrapper.js)
             └─► renderLine (lineRenderer.js)

(futuro)
transposeManager ─► songParser
                 └─► transpose (transpose.js)
                 └─► songRenderer
```

</details>

---

## ✅ Próximos Passos Sugeridos

<details>
<summary><strong>Para Integração Completa</strong></summary>

1. **Integrar na aplicação (`song.js`)**
   - Ao carregar música do Firestore, aplicar `parseSong()`
   - Ao renderizar, aplicar `renderSong()`
   - Determinar `maxWidth` apropriado (baseado em largura da tela)

2. **Testar em dispositivos reais**
   - Verificar se quebras ficam naturais
   - Ajustar `maxWidth` se necessário
   - Validar com diferentes tamanhos de fonte

3. **Integrar transposição**
   - Criar função que transpõe estrutura completa
   - Aplicar `transpose()` em cada cifra do array
   - Manter letra intacta

4. **Otimizar performance**
   - Cachear parsing se música não mudou
   - Recalcular wrapping apenas quando tela redimensiona
   - Considerar web workers para músicas muito grandes

</details>

---

## 📝 Notas Finais

Este documento reflete o estado do código em **24 de dezembro de 2025**. Toda a lógica de parsing, wrapping e rendering está funcionando e testada. O próximo passo é a integração com a aplicação existente.

**Comando para rodar testes:**
```bash
npm test              # Modo watch
npm run test:run      # Single run
```

**Total de testes:** 64 passando ✅
