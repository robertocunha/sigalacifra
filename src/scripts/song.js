// CSS imports
import '../css/design-tokens.css';
import '../css/components.css';

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { db } from './firebaseConfig.prod.js';
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { transposeChord } from './transpose.js';
import { parseSong } from './songParser.js';
import { renderSong } from './songRenderer.js';

// ============================================
// DRAWER FUNCTIONALITY
// ============================================

// Elementos do drawer
const drawerToggle = document.getElementById('drawerToggle');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');

// Função para abrir o drawer
const openDrawer = () => {
  drawer.classList.add('active');
  drawerOverlay.classList.add('active');
  drawerToggle.classList.add('active');
  document.body.style.overflow = 'hidden'; // Previne scroll do body
};

// Função para fechar o drawer
const closeDrawer = () => {
  drawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  drawerToggle.classList.remove('active');
  document.body.style.overflow = ''; // Restaura scroll do body
};

// Event listeners do drawer
if (drawerToggle) {
  drawerToggle.addEventListener('click', openDrawer);
}

if (drawerClose) {
  drawerClose.addEventListener('click', closeDrawer);
}

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', closeDrawer);
}

// Fechar drawer com tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer.classList.contains('active')) {
    closeDrawer();
  }
});

// ============================================
// SYNC DRAWER WITH DESKTOP CONTROLS
// ============================================

// Função para sincronizar tone display entre desktop e drawer
const syncToneDisplay = (newTone) => {
  const toneDesktop = document.getElementById('toneId');
  const toneDrawer = document.getElementById('toneIdDrawer');
  const tonePrint = document.getElementById('tonePrintId');
  
  if (toneDesktop) toneDesktop.textContent = newTone;
  if (toneDrawer) toneDrawer.textContent = newTone;
  if (tonePrint) tonePrint.textContent = newTone;
};

// Função para sincronizar edit toggle entre desktop e drawer
const syncEditToggle = (isChecked) => {
  const editToggleDesktop = document.getElementById('editToggleId');
  const editToggleDrawer = document.getElementById('editToggleIdDrawer');
  
  if (editToggleDesktop) editToggleDesktop.checked = isChecked;
  if (editToggleDrawer) editToggleDrawer.checked = isChecked;
};

// ============================================
// ORIGINAL SONG.JS CODE
// ============================================

// Captura o ID da música do parâmetro "id" no URL
const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('id');

if (songId) {
  const title = document.getElementById("titleId");
  const artist = document.getElementById("artistId");
  const tone = document.getElementById("toneId");
  const tonePrint = document.getElementById("tonePrintId");
  const preElement = document.querySelector("pre");

  // Desktop controls
  const editToggle = document.getElementById("editToggleId");
  const saveButton = document.getElementById("saveButtonId");
  const deleteButton = document.getElementById("deleteButtonId");
  const printButton = document.getElementById("printButtonId");
  const increaseToneButton = document.getElementById("increaseToneId");
  const decreaseToneButton = document.getElementById("decreaseToneId");
  const increaseFontButton = document.getElementById("increaseFontId");
  const decreaseFontButton = document.getElementById("decreaseFontId");

  // Drawer controls
  const editToggleDrawer = document.getElementById("editToggleIdDrawer");
  const saveButtonDrawer = document.getElementById("saveButtonIdDrawer");
  const deleteButtonDrawer = document.getElementById("deleteButtonIdDrawer");
  const printButtonDrawer = document.getElementById("printButtonIdDrawer");
  const increaseToneButtonDrawer = document.getElementById("increaseToneIdDrawer");
  const decreaseToneButtonDrawer = document.getElementById("decreaseToneIdDrawer");
  const increaseFontButtonDrawer = document.getElementById("increaseFontIdDrawer");
  const decreaseFontButtonDrawer = document.getElementById("decreaseFontIdDrawer");

  // Font size control (resets to 16px on page load)
  let currentFontSize = 16;
  const MIN_FONT_SIZE = 10;
  const MAX_FONT_SIZE = 20;

  const updateFontSize = (newSize) => {
    currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
    preElement.style.fontSize = `${currentFontSize}px`;
    
    // Re-render song with new wrapping based on new font size
    if (currentSongData && currentSongData.linePairs) {
      const maxWidth = calculateMaxWidth();
      const renderedHtml = renderSong(currentSongData.linePairs, maxWidth);
      preElement.innerHTML = renderedHtml;
    }
  };

  // Desktop font controls
  increaseFontButton.addEventListener('click', () => {
    updateFontSize(currentFontSize + 1);
  });

  decreaseFontButton.addEventListener('click', () => {
    updateFontSize(currentFontSize - 1);
  });

  // Drawer font controls
  increaseFontButtonDrawer.addEventListener('click', () => {
    updateFontSize(currentFontSize + 1);
  });

  decreaseFontButtonDrawer.addEventListener('click', () => {
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
    
    return Math.max(20, maxChars); // Minimum 20 chars (reduced from 40)
  };

  // Remove trailing whitespace/newlines from rendered HTML to avoid blank printed pages
  const sanitizeRenderedHtml = (html) => {
    if (typeof html !== 'string') return html;
    return html.replace(/\s+$/, '');
  };

  // Função que lida com a atualização da interface com os dados da música
  const updateSongData = (songData) => {
    currentSongData = songData; // Armazena os dados para uso posterior
    title.innerHTML = songData.title;
    artist.innerHTML = songData.artist || 'Artista desconhecido'; // Exibe 'Artista desconhecido' se não houver dados
    
    // Sincroniza tom em todos os lugares
    syncToneDisplay(songData.tone);
    
    // Parse plain text to structured data
    const linePairs = parseSong(songData.letra);
    
    // Store parsed data for later use (transpose, font size changes, etc.)
    currentSongData.linePairs = linePairs;
    
    // Render structured data with wrapping
    const maxWidth = calculateMaxWidth();
    const renderedHtml = renderSong(linePairs, maxWidth);
    preElement.innerHTML = sanitizeRenderedHtml(renderedHtml);
    
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
        const maxWidth = calculateMaxWidth();
        const renderedHtml = renderSong(currentSongData.linePairs, maxWidth);
        preElement.innerHTML = renderedHtml;
      }
    }, 300); // Wait 300ms after resize stops
  });

  // Re-render for print with narrow maxWidth for two-column layout
  let normalRenderedContent = null;

  window.addEventListener('beforeprint', () => {
    // Close drawer before printing to avoid interference
    closeDrawer();
    
    if (currentSongData && currentSongData.linePairs) {
      // Save current content
      normalRenderedContent = preElement.innerHTML;
      
      // Use fixed width for print columns (optimized for A4 paper with 2 columns)
      // A4 width with 2 columns and margins allows ~110-120 chars per column
      const printMaxWidth = 115;
      
      // Re-render with narrow width
      const renderedHtml = renderSong(currentSongData.linePairs, printMaxWidth);
      preElement.innerHTML = sanitizeRenderedHtml(renderedHtml);
    }
  });

  window.addEventListener('afterprint', () => {
    if (normalRenderedContent) {
      preElement.innerHTML = sanitizeRenderedHtml(normalRenderedContent);
      normalRenderedContent = null;
    }
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

    // Transpõe o tom e sincroniza em todos os displays
    const currentTone = tone.textContent.trim();
    const transposedTone = transposeChord(currentTone, steps);
    syncToneDisplay(transposedTone);
    currentSongData.tone = transposedTone;

    // Re-renderiza a música
    const maxWidth = calculateMaxWidth();
    const renderedHtml = renderSong(transposedLinePairs, maxWidth);
    preElement.innerHTML = sanitizeRenderedHtml(renderedHtml);
  };

  // Desktop transpose controls
  increaseToneButton.addEventListener("click", () => {
    transposeChords(1);
    hasUnsavedChanges = true;
  });

  decreaseToneButton.addEventListener("click", () => {
    transposeChords(-1);
    hasUnsavedChanges = true;
  });

  // Drawer transpose controls
  increaseToneButtonDrawer.addEventListener("click", () => {
    transposeChords(1);
    hasUnsavedChanges = true;
  });

  decreaseToneButtonDrawer.addEventListener("click", () => {
    transposeChords(-1);
    hasUnsavedChanges = true;
  });

  // Desktop edit toggle
  editToggle.addEventListener("change", () => {
    const isEditing = editToggle.checked;
    preElement.contentEditable = isEditing ? "true" : "false";
    syncEditToggle(isEditing);
    
    if (isEditing) {
      preElement.focus();
    }
  });

  // Drawer edit toggle
  editToggleDrawer.addEventListener("change", () => {
    const isEditing = editToggleDrawer.checked;
    preElement.contentEditable = isEditing ? "true" : "false";
    syncEditToggle(isEditing);
    
    if (isEditing) {
      preElement.focus();
      closeDrawer(); // Fecha o drawer ao ativar edição
    }
  });

  // Detecta alterações no conteúdo editável
  preElement.addEventListener("input", () => {
    if (editToggle.checked || editToggleDrawer.checked) {
      hasUnsavedChanges = true;
    }
  });

  // Aviso ao tentar sair com edições não salvas
  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
      return "";
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

  // Função de salvar compartilhada
  const performSave = async () => {
    const plainText = preElement.textContent;
    const updatedTone = tone.textContent.trim();
    const updatedLetra = parseSong(plainText);

    try {
      await setDoc(docRef, { letra: updatedLetra, tone: updatedTone }, { merge: true });
      hasUnsavedChanges = false;
      
      // Desliga o modo de edição
      syncEditToggle(false);
      preElement.contentEditable = "false";
      
      // Fecha o drawer se estiver aberto
      closeDrawer();
      
      // Mostra feedback visual
      if (localStorage.getItem('hideSaveNotification') !== 'true') {
        showSaveNotification();
      }
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      alert("Erro ao salvar a música. Tente novamente.");
    }
  };

  // Desktop save button
  saveButton.addEventListener("click", performSave);
  
  // Drawer save button
  saveButtonDrawer.addEventListener("click", performSave);

  // Função para mostrar notificação de salvamento
  function showSaveNotification() {
    const existingNotification = document.getElementById('saveNotification');
    if (existingNotification) {
      existingNotification.remove();
    }

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
    
    const checkbox = notification.querySelector('#dontShowAgain');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('hideSaveNotification', 'true');
      }
    });
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Função de deletar compartilhada
  const performDelete = async () => {
    const songTitle = title.textContent;
    const confirmed = confirm(`Tem certeza que deseja deletar "${songTitle}"?`);
    
    if (!confirmed) return;

    try {
      const redirectTo = currentSongData?.active ? "index.html" : "archived.html";
      await deleteDoc(docRef);
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Erro ao deletar a música:", error);
      alert("Erro ao deletar a música. Tente novamente.");
    }
  };

  // Desktop delete button
  deleteButton.addEventListener("click", performDelete);
  
  // Drawer delete button
  deleteButtonDrawer.addEventListener("click", performDelete);

  // Função de imprimir compartilhada
  const performPrint = () => {
    window.print();
  };

  // Desktop print button
  printButton.addEventListener("click", performPrint);
  
  // Drawer print button
  printButtonDrawer.addEventListener("click", performPrint);

} else {
  console.error("ID da música não encontrado na URL.");
}