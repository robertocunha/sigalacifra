# Structured Data Refactoring - V2

## Terminologia

Para evitar ambiguidade, este documento usa os seguintes termos:

- **Line pair** (ou apenas "line"): Unidade semântica completa composta de uma chord line + uma lyrics line que estão relacionadas
- **Chord line**: A linha superior contendo os acordes
- **Lyrics line**: A linha inferior contendo a letra da música
- **Line wrapping**: Processo de dividir uma line pair em múltiplas line pairs quando ela ultrapassa o limite de caracteres

**Exemplo de uma line pair:**
```
G7··········C·····Dm7    ← chord line
····Era·uma·casa······   ← lyrics line
```

## Descrição do Problema (esboço 18/12/2025)

### Situação Atual

Atualmente, as cifras são renderizadas em um elemento `<pre>` com `overflow-x: auto`. Quando uma linha é longa demais para a tela (por exemplo, quando o usuário aumenta o tamanho da fonte), aparece **scroll horizontal** em vez de quebra de linha.

Isso mantém as cifras alinhadas, mas prejudica a usabilidade em dispositivos móveis.

### O Problema com Quebra Automática Simples

Se tentarmos resolver o scroll horizontal usando quebra de linha automática do navegador (ex: `white-space: pre-wrap`), teremos um problema grave.

Consideremos o seguinte exemplo: 
Obs: Estou usando pontos (`·`) para indicar espaços

```
G7··········C·····Dm7·······G7···C·········A7····Dm7·······G7····C
····Era·uma·casa······muito·engraçada,·não·tinha·teto,·não·tinha·nada

·····················G7···C·······A7·····Dm7······G7····C
Ninguém·podia·entrar·nela·não,·porque·na·casa·não·tinha·chão

```

Com quebra automática simples, o navegador quebraria a linha onde couber, sem considerar a relação semântica entre cifras e letras. Teríamos algo assim: 

```
G7··········C·····Dm7·······G7···C·········
A7····Dm7·······G7····C
····Era·uma·casa······muito·engraçada,·não·
tinha·teto,·não·tinha·nada
```

**Problema:** As cifras ficam desalinhadas das sílabas correspondentes. O `A7` deveria estar sobre "tinha", não em uma linha separada. A música se torna impossível de tocar.

### O Comportamento Desejado

O que precisamos é uma quebra **inteligente** que respeite a unidade semântica cifras+letra: 

``` 
G7··········C·····Dm7·······G7···C·········
····Era·uma·casa······muito·engraçada,·não·
A7····Dm7·······G7····C
tinha·teto,·não·tinha·nada
```

**Observação importante:** Os espaços na letra não são meramente estéticos - eles indicam o timing exato dos acordes, incluindo acordes tocados antes da voz entrar (como os 4 espaços iniciais antes de "Era") ou em pausas instrumentais (como os espaços entre "casa" e "muito" onde o Dm7 é tocado). Cada caractere tem significado posicional.

## A Solução Proposta

### Dados Estruturados com Posicionamento

A solução é transformar o texto plano em uma estrutura de dados que **separa cifras e letras**, mas **preserva o relacionamento posicional** entre eles.

**Algoritmo geral de quebra:**
1. Verificar o comprimento da chord line E da lyrics line
2. Se **qualquer uma** ultrapassar o limite de caracteres → quebrar a line pair
3. Quebrar no espaço apropriado da lyrics line (não no meio de palavras)
4. As cifras são redistribuídas automaticamente nas line pairs resultantes baseado em suas posições
5. Se os espaços forem preservados consistentemente, o alinhamento se mantém

**Exemplo - texto original:**
```
G7··········C·····Dm7·······G7···C·········A7····Dm7·······G7····C
····Era·uma·casa······muito·engraçada,·não·tinha·teto,·não·tinha·nada
```

**Transformado em estrutura:**
```javascript
{
  chords: [
    { position: 0, chord: "G7" },
    { position: 12, chord: "C" },
    { position: 18, chord: "Dm7" },
    { position: 26, chord: "G7" },
    // ... etc
  ],
  lyrics: "    Era uma casa      muito engraçada, não tinha teto, não tinha nada"
}
```

A `position` indica o **índice do caractere** na string de letras onde cada cifra deve aparecer. Isso preserva o relacionamento cifra↔sílaba independente de como renderizamos.

### Como a Quebra Inteligente Funciona

Com os dados estruturados, podemos quebrar a linha preservando o alinhamento:

**Situação:** Linha original tem 70 caracteres, mas tela só comporta 16.

**Passo 1 - Quebrar a letra no caractere 16:**
```
Parte 1 (0-15):  "    Era uma casa"
Parte 2 (16+):   "      muito engraçada, não tinha teto, não tinha nada"
```

**Passo 2 - Distribuir cifras nas partes correspondentes:**
- G7 (posição 0): está em 0-15 → vai para Parte 1, posição 0
- C (posição 12): está em 0-15 → vai para Parte 1, posição 12
- Dm7 (posição 18): está após 16 → vai para Parte 2, posição 18-16 = **2**
- etc.

**Resultado renderizado:**
```
G7··········C···
····Era·uma·casa
··Dm7·······G7···C·········A7····Dm7·······G7····C
······muito·engraçada,·não·tinha·teto,·não·tinha·nada
```

Note que o Dm7 ficou com **2 espaços à esquerda** na nova linha, preservando exatamente sua distância original em relação a "muito". O alinhamento cifra↔sílaba é mantido perfeitamente.

### Fórmula Geral

Para cada cifra em uma linha quebrada:
```javascript
novaPosicao = posicaoOriginal - inicioSublinha
```

Se `novaPosicao >= 0` e a cifra está dentro do range da sublinha, ela pertence à sublinha atual.

### Exemplo Completo de Quebra em Múltiplas Linhas

Considerando a linha original quebrada em linhas de até ~16 caracteres:

**Original:**
```
G7··········C·····Dm7·······G7···C·········A7····Dm7·······G7····C
····Era·uma·casa······muito·engraçada,·não·tinha·teto,·não·tinha·nada
```

**Após quebras inteligentes (nos espaços entre palavras):**
```
G7··········C···
····Era·uma·casa
··Dm7·······
······muito·
G7···C·········
engraçada,·não·
A7····Dm7·······
tinha·teto,·não·
G7····C
tinha·nada
```

Cada cifra mantém sua posição exata em relação à sílaba correspondente, mesmo após múltiplas quebras.

### Caso Especial: Quebra Determinada pelas Cifras

Às vezes, a linha de letras cabe no limite, mas a linha de cifras não. Nesse caso, ainda precisamos quebrar.

**Exemplo - Original:**
```
C·········Dm7·····F    
Marcha·soldado
··Dm7·······G7
Cabeça·de·papel
```

A primeira linha de letras `"Marcha soldado"` tem apenas 14 caracteres (cabe em 16). Porém, a linha de cifras `"C·········Dm7·····F"` tem 19 caracteres (não cabe).

**Após quebra em 16 caracteres:**
```
C······    
Marcha·
···Dm7·····F
soldado
··Dm7·······G7
Cabeça·de·papel
```

Note que:
- A quebra ocorreu após "Marcha " (posição 7)
- C permanece na posição 0 (sobre espaços antes de "Marcha")
- Dm7 (originalmente posição 10) agora está na posição 10-7=3, sobre o "d" de "soldado"
- F (originalmente posição 16) agora está na posição 16-7=9, cinco espaços após o "o" de "soldado"

**Conclusão:** O algoritmo precisa verificar **tanto** a linha de letras **quanto** a linha de cifras para determinar se há necessidade de quebra.

## Estratégia de Implementação

### Abordagem TDD (Test-Driven Development)

Dada a complexidade do algoritmo de quebra (espaços entre palavras, cifras que podem ficar "cortadas", etc.), a melhor abordagem é descobrir e refinar o algoritmo **incrementalmente através de testes**.

**Princípios:**
1. Começar com casos simples (linha que cabe inteira, linha com uma quebra simples)
2. Adicionar testes para casos mais complexos conforme necessário
3. Deixar o algoritmo emergir da solução dos casos de teste
4. Não tentar resolver todos os edge cases mentalmente antes de começar

**Casos de teste sugeridos (ordem de complexidade):**

1. **Linha que não precisa quebrar** (< 16 chars)
2. **Uma quebra simples** (linha com ~30 chars, quebra no espaço)
3. **Múltiplas quebras** (linha longa com várias palavras)
4. **Cifras nos espaços** (antes da letra começar, entre palavras)
5. **Quebra próxima a uma cifra** (garantir que cifra não fica "cortada")
6. **Linha sem espaços para quebrar** (palavra muito longa - edge case raro)

### O que temos de Sólido

✅ **Problema claramente definido**
✅ **Estrutura de dados definida** (chords array com position)
✅ **Fórmula de recálculo de posição** (`novaPosicao = original - inicio`)
✅ **Exemplo visual completo** de como deve ficar

❓ **Detalhes do algoritmo de quebra** serão descobertos via TDD

## Progresso Atual (19/12/2025)

### ✅ Implementado

#### 1. Módulo de Parsing (`lineParser.js`)
**Função:** `parseLine(chordLine, lyricsLine)`  
**Responsabilidade:** Converte duas strings (cifras e letra) em estrutura de dados.

**Algoritmo:**
- Loop pelos caracteres da linha de cifras
- Identifica sequências de caracteres não-espaço como acordes
- Registra posição inicial e texto de cada acorde
- Retorna `{ chords: [{position, chord}], lyrics: string }`

**Testes (3):**
- ✅ Parsing com um acorde simples
- ✅ Parsing com dois acordes
- ✅ Preservação de espaços iniciais

**Arquivo:** `src/scripts/lineParser.js` e `src/scripts/lineParser.test.js`

#### 2. Módulo de Renderização (`lineRenderer.js`)
**Função:** `renderLine(lineData)`  
**Responsabilidade:** Converte estrutura de dados de volta para texto (duas linhas separadas por `\n`).

**Algoritmo:**
- Cria array de espaços do tamanho da letra
- Coloca cada acorde na sua posição correspondente
- Junta array em string para formar linha de cifras
- Retorna `chordLine + '\n' + lyricsLine`

**Testes (3):**
- ✅ Renderização com um acorde
- ✅ Renderização com dois acordes
- ✅ Round-trip (parse → render → parse = estrutura idêntica)

**Arquivo:** `src/scripts/lineRenderer.js` e `src/scripts/lineRenderer.test.js`

#### 3. Módulo de Quebra de Linha (`lineWrapper.js`)
**Função:** `wrapLine(lineData, maxWidth)`  
**Responsabilidade:** Quebra uma line pair em múltiplas line pairs quando excede o limite.

**Algoritmo:**
1. Calcula comprimento máximo entre letra e cifras (última cifra + seu tamanho)
2. Se não ultrapassa `maxWidth`, retorna array com line pair original
3. Se ultrapassa, procura último espaço antes de `maxWidth`
4. **Importante:** Verifica se quebra cortaria alguma cifra ao meio
   - Tenta quebrar após o espaço (i+1)
   - Se cortaria cifra, tenta quebrar antes do espaço (i)
   - Se ainda cortaria, continua procurando espaço anterior
5. Divide letra no ponto de quebra
6. Redistribui cifras nas duas partes:
   - Cifras que terminam antes do ponto de quebra → primeira parte
   - Demais cifras → segunda parte (com posição recalculada: `posição - pontoDeQuebra`)

**Testes (3):**
- ✅ Não quebrar linha que cabe
- ✅ Quebrar no limite de palavra
- ✅ **Não cortar acorde ao meio** (caso crítico identificado pelo usuário)

**Arquivo:** `src/scripts/lineWrapper.js` e `src/scripts/lineWrapper.test.js`

**Caso crítico resolvido:** Se acorde "Am" está na posição 6 e tem 2 caracteres (ocupa 6-7), quebrar na posição 7 cortaria o acorde. O algoritmo detecta isso e quebra na posição 6 ao invés.

### 📊 Status dos Testes
- **Total:** 57 testes passando
- **Originais:** 48 testes (transpose.test.js: 26, chordParser.test.js: 22)
- **Novos:** 9 testes (lineParser: 3, lineRenderer: 3, lineWrapper: 3)
- **Comando:** `npm test`

### ⏳ Próximas Etapas

1. **Adicionar mais testes ao lineWrapper:**
   - Múltiplas quebras em uma mesma linha
   - Cifras em posições variadas (início, meio, fim)
   - Linhas muito longas
   - Edge case: palavra muito longa sem espaços

2. **Implementar quebra recursiva:**
   - Atualmente `wrapLine` faz apenas uma quebra
   - Precisa chamar recursivamente para segunda parte se ela também exceder maxWidth

3. **Integração com a aplicação:**
   - Modificar `song.js` para usar os novos módulos
   - Converter dados existentes do Firestore (se necessário)
   - Atualizar renderização das cifras na tela

4. **Melhorias na renderização:**
   - Considerar se HTML é necessário (tags para cifras vs texto plano)
   - Estilização CSS para mobile
   - Testes com tamanhos de fonte variados

### 🔧 Configuração Técnica

**Stack:**
- Vanilla JavaScript (ES6 modules)
- Vitest para testes
- Firebase/Firestore (banco de dados)
- Webpack (bundling)
- Bootstrap 5 (UI)

**Estrutura de arquivos criados:**
```
src/scripts/
  lineParser.js       - Parse texto → estrutura
  lineParser.test.js  - 3 testes
  lineRenderer.js     - Render estrutura → texto
  lineRenderer.test.js - 3 testes
  lineWrapper.js      - Quebra inteligente de linhas
  lineWrapper.test.js - 3 testes
```

### 📝 Notas Importantes para Continuação

1. **Espaços têm significado posicional:** Não são apenas estética, indicam timing dos acordes
2. **Quebra considera cifras E letras:** Ambas as linhas precisam ser verificadas
3. **Não cortar acordes:** Algoritmo já implementado para evitar isso
4. **Fórmula de recálculo:** `novaPosicao = posicaoOriginal - pontoDeQuebra`
5. **TDD funcionou muito bem:** Continue com essa abordagem incremental
6. **Round-trip validado:** Garantia de que parse→render não perde dados

### 🐛 Observações sobre Performance

- Conversas muito longas podem causar lentidão no Claude
- Testes em watch mode (`npm test lineWrapper`) podem não liberar prompt
- Pressionar Ctrl+C uma vez é suficiente para sair
- Em caso de problemas, iniciar novo chat com este documento atualizado

