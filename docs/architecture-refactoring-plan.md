# Plano de Refatoração da Arquitetura

> Criado em: 4 de janeiro de 2026  
> Status: Carta de intenções / Planejamento

## Contexto

Projeto está funcionando bem como MVP. Código foi escrito majoritariamente pelo Claude em iterações anteriores. Agora que tá rodando, é hora de estudar melhor o código e preparar terreno para:
- Implementar features mais complexas com menor risco
- Eventualmente portar para outros frameworks (React, Svelte, Web Components/Lit)
- Aprender boas práticas de arquitetura em vanilla JS

## Estado Atual

### ✅ O que está BOM (não mexer)

**Pipeline de processamento** - bem modular e framework-agnostic:
- `chordParser.js` → identifica acordes e linhas de acordes
- `lineParser.js` → transforma texto em estrutura de dados
- `songParser.js` → orquestra o parsing da música
- `lineWrapper.js` → quebra linhas longas
- `lineRenderer.js` → transforma estrutura em HTML/texto
- `songRenderer.js` → renderiza música completa
- `transpose.js` → transposição de acordes

**Pontos fortes:**
- Funções puras (input → output, sem estado escondido)
- Cada módulo tem responsabilidade clara
- Testáveis isoladamente
- Podem ser reaproveitados em qualquer framework

### ⚠️ O que precisa ATENÇÃO

**`song.js` (525 linhas) - O Frankenstein**

Mistura muitas responsabilidades:
- ✋ Lógica de negócio (transposição, cálculo de fonte, wrapping)
- ✋ Gerenciamento de estado (tom atual, fonte, dados da música)
- ✋ UI/Event handlers (cliques, drawer, sync desktop/mobile)
- ✋ Persistência (Firebase listeners e updates)
- ✋ Controles duplicados (desktop + drawer)

**Problemas:**
- Difícil de testar (tudo amarrado no DOM)
- Duplicação de código (sincronização desktop/drawer)
- Impossível reaproveitar em outro framework
- Adicionar features complexas tem risco de quebrar coisas

## Plano de Refatoração

### 1. Extrair Camada de Estado/Modelo

**Criar `SongModel.js` (ou `SongState.js`):**

```javascript
class SongModel {
  constructor(songData) {
    this.title = songData.title;
    this.artist = songData.artist;
    this.originalTone = songData.tone;
    this.currentTone = songData.tone;
    this.linePairs = songData.linePairs;
    this.fontSize = 16;
    this.isEditing = false;
  }

  transpose(semitones) {
    // lógica de transposição
    // retorna novo estado ou atualiza interno
  }

  changeFontSize(delta) {
    // lógica de ajuste de fonte
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  // getters, métodos auxiliares, etc.
}
```

**Benefícios:**
- Lógica de negócio isolada
- Testável sem DOM
- Reaproveitável em qualquer UI (vanilla, React, WC, etc.)
- Estado centralizado e previsível

### 2. Separar Camada de Persistência

**Criar `songRepository.js`:**

```javascript
export class SongRepository {
  constructor(db) {
    this.db = db;
  }

  async loadSong(id) {
    // retorna Promise com dados da música
  }

  async saveSong(id, songData) {
    // salva no Firebase
  }

  async deleteSong(id) {
    // deleta do Firebase
  }

  subscribeTo(id, callback) {
    // retorna unsubscribe function
    // chama callback quando dados mudam
  }
}
```

**Benefícios:**
- Pode trocar Firebase por LocalStorage/API REST facilmente
- Testável com mocks
- Não precisa conhecer a UI

### 3. Reduzir Duplicação Desktop/Drawer

**Opção A - Event Delegation:**
Criar sistema de eventos customizados onde controles disparam eventos e um controller central lida com eles.

**Opção B - UI Helpers:**
Criar funções helper que atualizam múltiplos elementos de uma vez:
```javascript
function updateToneDisplay(newTone) {
  document.getElementById('toneId').textContent = newTone;
  document.getElementById('toneIdDrawer').textContent = newTone;
  document.getElementById('tonePrintId').textContent = newTone;
}
```

**Opção C - Web Components (futuro):**
`<tone-display>` recebe o tom como prop e se auto-atualiza.

### 4. Estrutura Proposta

```
scripts/
  models/
    SongModel.js          # Estado e lógica de negócio
  
  repositories/
    songRepository.js     # Persistência (Firebase)
  
  parsers/
    chordParser.js        # ✅ já existe e tá bom
    lineParser.js         # ✅ já existe e tá bom
    songParser.js         # ✅ já existe e tá bom
  
  renderers/
    lineRenderer.js       # ✅ já existe e tá bom
    lineWrapper.js        # ✅ já existe e tá bom
    songRenderer.js       # ✅ já existe e tá bom
  
  utils/
    transpose.js          # ✅ já existe e tá bom
  
  ui/
    songController.js     # Conecta UI com modelo
    drawerController.js   # Lógica específica do drawer
  
  song.js                 # Arquivo principal (bem mais magro)
```

## Estratégia de Execução

### Abordagem Incremental (recomendada):

1. **Extrair SongModel primeiro**
   - Criar classe
   - Migrar lógica de transposição, fonte, etc.
   - Testar isoladamente
   - Refatorar song.js pra usar o modelo

2. **Extrair SongRepository**
   - Isolar código do Firebase
   - Adaptar song.js pra usar repository

3. **Reduzir duplicação UI**
   - Criar helpers ou sistema de eventos
   - Limpar código repetido

4. **Reorganizar estrutura de pastas**
   - Mover arquivos
   - Ajustar imports

### OU: Abordagem Big Bang (mais arriscada):

Fazer tudo de uma vez. Só recomendado se tiver:
- Tempo disponível
- Testes automatizados (não temos ainda!)
- Backup do código atual

## Próximos Passos

- [ ] Decidir se vale fazer refatoração antes de portar pra WC
- [ ] Escolher por onde começar (sugestão: SongModel)
- [ ] Criar branch para experimentar
- [ ] Considerar adicionar testes antes de refatorar (segurança)

## Notas sobre Web Components

Web Components são sobre **encapsulamento de UI**, não gerenciamento de estado.

Se formos pra WC:
- Os parsers/renderers continuam iguais
- SongModel vira o "store" compartilhado
- Componentes recebem dados via props
- Comunicação via eventos customizados
- Ainda vai precisar camada de estado (Lit tem utilidades, mas não é obrigatório)

## Filosofia

> "Primeiro organiza a bagunça da casa, depois decide se troca os móveis."

- Refatorar em vanilla ensina arquitetura sem adicionar complexidade de framework
- Código bem arquitetado é fácil de portar
- Não mexer no que tá funcionando bem (os parsers/renderers)
- Foco em separar responsabilidades e reduzir acoplamento

---

## Referências

Conversas e decisões relacionadas:
- Esta refatoração surgiu de discussão sobre modularidade (4 jan 2026)
- Objetivo: preparar terreno para features complexas e experimentação com frameworks
