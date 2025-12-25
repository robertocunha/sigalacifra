import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { db } from './firebaseConfig.js';
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { transposeChord } from './transpose.js';
import { parseSong } from './songParser.js';
import { renderSong } from './songRenderer.js';

// Captura o ID da música do parâmetro "id" no URL
const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('id');

if (songId) {
  const title = document.getElementById("titleId");
  const artist = document.getElementById("artistId");
  const tone = document.getElementById("toneId");
  const tonePrint = document.getElementById("tonePrintId");
  const preElement = document.querySelector("pre");

  const editToggle = document.getElementById("editToggleId");
  const saveButton = document.getElementById("saveButtonId");
  const deleteButton = document.getElementById("deleteButtonId");
  const printButton = document.getElementById("printButtonId");
  const increaseToneButton = document.getElementById("increaseToneId");
  const decreaseToneButton = document.getElementById("decreaseToneId");
  const increaseFontButton = document.getElementById("increaseFontId");
  const decreaseFontButton = document.getElementById("decreaseFontId");

  // Font size control (resets to 16px on page load)
  let currentFontSize = 16;
  const MIN_FONT_SIZE = 10;
  const MAX_FONT_SIZE = 20;

  const updateFontSize = (newSize) => {
    currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
    preElement.style.fontSize = `${currentFontSize}px`;
    
    console.log('Font size changed to:', currentFontSize);
    
    // Re-render song with new wrapping based on new font size
    if (currentSongData && currentSongData.linePairs) {
      console.log('Re-rendering song with new font size...');
      const maxWidth = calculateMaxWidth();
      const renderedHtml = renderSong(currentSongData.linePairs, maxWidth);
      preElement.innerHTML = renderedHtml;
      console.log('Song re-rendered!');
    } else {
      console.log('No song data to re-render');
    }
  };

  increaseFontButton.addEventListener('click', () => {
    updateFontSize(currentFontSize + 1);
  });

  decreaseFontButton.addEventListener('click', () => {
    updateFontSize(currentFontSize - 1);
  });

  // Referência ao documento do Firestore com base no ID capturado
  const docRef = doc(db, "musicas", songId);

  // Variável para armazenar o estado atual da música
  let currentSongData = null;
  let hasUnsavedChanges = false;

  // Calculate max width for wrapping based on pre element width and font size
  const calculateMaxWidth = () => {
    const computedStyle = window.getComputedStyle(preElement);
    const preWidth = preElement.clientWidth;
    const padding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const availableWidth = preWidth - padding;
    
    // Measure actual character width using a temporary span
    const measureSpan = document.createElement('span');
    measureSpan.style.font = computedStyle.font;
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.textContent = 'M'.repeat(100); // 100 chars to get average
    document.body.appendChild(measureSpan);
    const charWidth = measureSpan.offsetWidth / 100;
    document.body.removeChild(measureSpan);
    
    const maxChars = Math.floor(availableWidth / charWidth);
    
    console.log('DEBUG maxWidth:', { preWidth, padding, availableWidth, charWidth, maxChars });
    
    return Math.max(20, maxChars); // Minimum 20 chars (reduced from 40)
  };

  // Função que lida com a atualização da interface com os dados da música
  const updateSongData = (songData) => {
    currentSongData = songData; // Armazena os dados para uso posterior
    title.innerHTML = songData.title;
    artist.innerHTML = songData.artist || 'Artista desconhecido'; // Exibe 'Artista desconhecido' se não houver dados
    tone.innerHTML = songData.tone;
    if (tonePrint) {
      tonePrint.innerHTML = songData.tone;
    }
    
    // Parse plain text to structured data
    const linePairs = parseSong(songData.letra);
    
    // Store parsed data for later use (transpose, font size changes, etc.)
    currentSongData.linePairs = linePairs;
    
    // Render structured data with wrapping
    const maxWidth = calculateMaxWidth();
    const renderedHtml = renderSong(linePairs, maxWidth);
    preElement.innerHTML = renderedHtml;
    
    hasUnsavedChanges = false; // Reset ao carregar novos dados
  };

  // Substitui o getDoc por onSnapshot para receber atualizações em tempo real
  const fetchSongData = () => {
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const songData = docSnap.data();
        updateSongData(songData);
      } else {
        console.log("Nenhum documento encontrado!");
      }
    }, (error) => {
      console.error("Erro ao buscar dados em tempo real:", error);
    });
  };

  // Executa a função para buscar os dados da música com onSnapshot
  fetchSongData();

  // Re-render on window resize to adjust wrapping
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentSongData && currentSongData.linePairs) {
        console.log('Window resized, re-rendering song...');
        const maxWidth = calculateMaxWidth();
        const renderedHtml = renderSong(currentSongData.linePairs, maxWidth);
        preElement.innerHTML = renderedHtml;
      }
    }, 300); // Wait 300ms after resize stops
  });

  preElement.contentEditable = "false";

  const transposeChords = (steps) => {
    // Verifica se há dados da música
    if (!currentSongData || !currentSongData.linePairs) {
      console.error("Não há conteúdo de letra para transpor.");
      return;
    }

    // Transpõe os acordes na estrutura de dados parseada
    const transposedLinePairs = currentSongData.linePairs.map(item => {
      if (item.chords && item.lyrics !== undefined) {
        // É um line pair - transpõe os acordes
        return {
          chords: item.chords.map(({ position, chord }) => ({
            position,
            chord: transposeChord(chord, steps)
          })),
          lyrics: item.lyrics
        };
      }
      // Outros tipos (empty, annotation) ficam como estão
      return item;
    });

    // Atualiza a estrutura parseada em memória
    currentSongData.linePairs = transposedLinePairs;

    // Transpõe o tom
    const currentTone = tone.textContent.trim();
    const transposedTone = transposeChord(currentTone, steps);
    tone.textContent = transposedTone;
    currentSongData.tone = transposedTone;
    if (tonePrint) {
      tonePrint.textContent = transposedTone;
    }

    // Re-renderiza a música
    const maxWidth = calculateMaxWidth();
    const renderedHtml = renderSong(transposedLinePairs, maxWidth);
    preElement.innerHTML = renderedHtml;
  };

  increaseToneButton.addEventListener("click", () => {
    console.log("Subindo tom...");
    transposeChords(1);
    hasUnsavedChanges = true; // Marca como alterado ao transpor
  });

  decreaseToneButton.addEventListener("click", () => {
    console.log("Descendo tom...");
    transposeChords(-1);
    hasUnsavedChanges = true; // Marca como alterado ao transpor
  });

  editToggle.addEventListener("change", () => {
    const isEditing = editToggle.checked;
    preElement.contentEditable = isEditing ? "true" : "false";
    
    // Se entrou em modo de edição, coloca o foco no elemento
    if (isEditing) {
      preElement.focus();
    }
  });

  // Detecta alterações no conteúdo editável
  preElement.addEventListener("input", () => {
    if (editToggle.checked) {
      hasUnsavedChanges = true;
    }
  });

  // Aviso ao tentar sair com edições não salvas
  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ""; // Necessário para Chrome
      return ""; // Para outros navegadores
    }
  });

  // Atalhos de teclado
  document.addEventListener("keydown", (e) => {
    // Ctrl+S ou Cmd+S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveButton.click();
    }
    
    // Ctrl+E ou Cmd+E para toggle do modo edição
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      editToggle.checked = !editToggle.checked;
      editToggle.dispatchEvent(new Event('change'));
    }
  });

  saveButton.addEventListener("click", async () => {
    // Pega o texto puro editado pelo usuário
    const plainText = preElement.textContent;
    const updatedTone = tone.textContent.trim();

    // Converte texto puro para estrutura JSON
    const updatedLetra = parseSong(plainText);

    try {
      await setDoc(docRef, { letra: updatedLetra, tone: updatedTone }, { merge: true });
      console.log("Documento atualizado e formatado com sucesso!");
      hasUnsavedChanges = false; // Marca como salvo
      
      // Desliga o modo de edição
      editToggle.checked = false;
      preElement.contentEditable = "false";
      
      // Mostra feedback visual se o usuário não desabilitou
      if (localStorage.getItem('hideSaveNotification') !== 'true') {
        showSaveNotification();
      }
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      alert("Erro ao salvar a música. Tente novamente.");
    }
  });

  // Função para mostrar notificação de salvamento
  function showSaveNotification() {
    // Remove notificação anterior se existir
    const existingNotification = document.getElementById('saveNotification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Cria a notificação
    const notification = document.createElement('div');
    notification.id = 'saveNotification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 250px;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">✓</span>
        <span style="font-weight: 500;">Música salva com sucesso!</span>
      </div>
      <label style="font-size: 13px; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px;">
        <input type="checkbox" id="dontShowAgain" style="cursor: pointer;">
        Não exibir novamente
      </label>
    `;
    
    document.body.appendChild(notification);
    
    // Handler para o checkbox
    const checkbox = notification.querySelector('#dontShowAgain');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('hideSaveNotification', 'true');
      }
    });
    
    // Remove após 3 segundos
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  deleteButton.addEventListener("click", async () => {
    const songTitle = title.textContent;
    const confirmed = confirm(`Tem certeza que deseja deletar "${songTitle}"?`);
    
    if (!confirmed) return;

    try {
      // Determina para onde redirecionar baseado no estado 'active' da música
      const redirectTo = currentSongData?.active ? "index.html" : "archived.html";
      
      await deleteDoc(docRef);
      console.log("Música deletada com sucesso!");
      
      // Redireciona para a página apropriada
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Erro ao deletar a música:", error);
      alert("Erro ao deletar a música. Tente novamente.");
    }
  });

  printButton.addEventListener("click", () => {
    window.print();
  });
} else {
  console.error("ID da música não encontrado na URL.");
}
