import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { db } from './firebaseConfig.js';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { transposeChord } from './transpose.js';
import { parseChordSheet } from './chordParser.js';

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
  const increaseToneButton = document.getElementById("increaseToneId");
  const decreaseToneButton = document.getElementById("decreaseToneId");

  // Referência ao documento do Firestore com base no ID capturado
  const docRef = doc(db, "musicas", songId);

  // Função que lida com a atualização da interface com os dados da música
  const updateSongData = (songData) => {
    title.innerHTML = songData.title;
    artist.innerHTML = songData.artist || 'Artista desconhecido'; // Exibe 'Artista desconhecido' se não houver dados
    tone.innerHTML = songData.tone;
    if (tonePrint) {
      tonePrint.innerHTML = songData.tone;
    }
    preElement.innerHTML = songData.letra;
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

  preElement.contentEditable = "false";

  const transposeChords = (steps) => {
    // Verifica se a letra está disponível antes de transpor
    if (preElement.innerHTML.trim() === "") {
      console.error("Não há conteúdo de letra para transpor.");
      return; // Se a letra estiver vazia, não faz nada
    }

    const boldElements = preElement.querySelectorAll("b");
    boldElements.forEach((b) => {
      const originalChord = b.textContent.trim();
      const transposedChord = transposeChord(originalChord, steps);
      b.textContent = transposedChord;
    });

    const currentTone = tone.textContent.trim();
    const transposedTone = transposeChord(currentTone, steps);
    tone.textContent = transposedTone; // Atualiza o tom exibido na página
    if (tonePrint) {
      tonePrint.textContent = transposedTone; // Atualiza também a versão de impressão
    }
  };

  increaseToneButton.addEventListener("click", () => {
    console.log("Subindo tom...");
    transposeChords(1);
  });

  decreaseToneButton.addEventListener("click", () => {
    console.log("Descendo tom...");
    transposeChords(-1);
  });

  editToggle.addEventListener("change", () => {
    const isEditing = editToggle.checked;
    preElement.contentEditable = isEditing ? "true" : "false";
    
    // Se entrou em modo de edição, coloca o foco no elemento
    if (isEditing) {
      preElement.focus();
    }
  });

  saveButton.addEventListener("click", async () => {
    // Pega o conteúdo atual
    let updatedContent = preElement.innerHTML;
    const updatedTone = tone.textContent.trim();

    // Auto-formatar: converte HTML para texto puro e reaplicar parseChordSheet
    // Isso garante que acordes recém-adicionados fiquem laranja
    const plainText = preElement.textContent;
    updatedContent = parseChordSheet(plainText);
    
    // Atualiza a visualização imediatamente (feedback visual)
    preElement.innerHTML = updatedContent;

    try {
      await setDoc(docRef, { letra: updatedContent, tone: updatedTone }, { merge: true });
      console.log("Documento atualizado e formatado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
    }
  });
} else {
  console.error("ID da música não encontrado na URL.");
}
