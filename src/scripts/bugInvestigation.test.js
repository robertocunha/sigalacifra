import { describe, it, expect } from 'vitest';
import { parseSong } from './songParser.js';
import { renderSong } from './songRenderer.js';

describe('Bug Investigation - Line Wrapping Issues', () => {
  
  describe('Caso 1: Linha de letra SEM acordes acima', () => {
    it('should parse line without chords as annotation', () => {
      const input = `                D7M(2)         Em7(9)
Do que a gente junto, nós dois

Mil ideias e uma história de amor
       D7M(2)          Em7(9)
E o assunto é nós dois`;

      const result = parseSong(input);
      
      console.log('\n=== ESTRUTURA PARSEADA ===');
      console.log(JSON.stringify(result, null, 2));
      
      // Verificar quantos itens foram criados
      expect(result.length).toBeGreaterThan(0);
      
      // Encontrar item da linha "Mil ideias..."
      const milIdeiasItem = result.find(item => 
        item.text?.includes('Mil ideias')
      );
      
      console.log('\n=== ITEM "MIL IDEIAS" ===');
      console.log(JSON.stringify(milIdeiasItem, null, 2));
      
      // Esta linha deveria ser identificada como 'annotation'
      expect(milIdeiasItem?.type).toBe('annotation');
    });
    
    it('should render annotation WITH wrapping (bug fixed!)', () => {
      const input = `Mil ideias e uma história de amor`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 20); // maxWidth = 20
      
      console.log('\n=== RENDERIZADO (maxWidth=20) ===');
      console.log(rendered);
      
      // Annotations AGORA devem ser quebradas pelo songRenderer
      // Bug foi corrigido!
      const lines = rendered.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });
  
  describe('Caso 2: Linha com APENAS acordes (sem letra)', () => {
    it('should parse chord-only line correctly', () => {
      const input = `[Final] G7M  D7M(2)  G7M  D7M(2)`;
      const result = parseSong(input);
      
      console.log('\n=== ESTRUTURA PARSEADA (chord-only) ===');
      console.log(JSON.stringify(result, null, 2));
      
      // Verificar se foi identificado corretamente
      // Pode ser annotation (se "[Final]" confunde isChordLine)
      // OU pode ser linePair com lyrics vazia
      
      if (result[0].type === 'annotation') {
        console.log('⚠️  Linha foi identificada como ANNOTATION');
        expect(result[0].text).toBe(input);
      } else {
        console.log('✓ Linha foi identificada como CHORD LINE');
        expect(result[0].chords).toBeDefined();
        expect(result[0].lyrics).toBe('');
      }
    });
    
    it('should handle pure chord line without lyrics', () => {
      const input = `G7M  D7M(2)  G7M  D7M(2)`;
      const result = parseSong(input);
      
      console.log('\n=== ESTRUTURA PARSEADA (pure chords) ===');
      console.log(JSON.stringify(result, null, 2));
      
      // Linha sem "[Final]" - deve ser reconhecida como chord line
      expect(result[0].type).toBeUndefined(); // linePair não tem type
      expect(result[0].chords.length).toBeGreaterThan(0);
      expect(result[0].lyrics).toBe('');
    });
    
    it('should render chord-only line with wrapping (bug fixed!)', () => {
      const input = `G7M  D7M(2)  G7M  D7M(2)`;
      const parsed = parseSong(input);
      const rendered = renderSong(parsed, 15); // maxWidth = 15
      
      console.log('\n=== RENDERIZADO chord-only (maxWidth=15) ===');
      console.log(rendered);
      console.log('---');
      
      // Deve quebrar em múltiplas linhas (2 linhas com 2 acordes cada)
      const lines = rendered.split('\n').filter(l => l.trim() !== '');
      expect(lines.length).toBeGreaterThanOrEqual(2); // Pelo menos 2 linhas de acordes
    });
  });
  
  describe('Diagnóstico: isChordLine com annotations', () => {
    it('should identify what isChordLine returns for edge cases', async () => {
      const { isChordLine } = await import('./chordParser.js');
      
      const testCases = [
        'Mil ideias e uma história de amor',
        '[Final] G7M  D7M(2)  G7M  D7M(2)',
        'G7M  D7M(2)  G7M  D7M(2)',
        '[Intro] Am  F  C  G'
      ];
      
      console.log('\n=== TESTE isChordLine ===');
      testCases.forEach(line => {
        const result = isChordLine(line);
        console.log(`"${line}"`);
        console.log(`  → isChordLine: ${result}\n`);
      });
    });
  });
});
