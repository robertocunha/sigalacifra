import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// Imports de CSS para uso do Webpack
import '../css/print.css';
import '../css/style.css';

import { db } from './firebaseConfig.js';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { transposeChord } from './transpose.js';

// Captura o ID da música do parâmetro "id" no URL
const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('id');

if (songId) {
  const title = document.getElementById("titleId");
  const artist = document.getElementById("artistId");
  const tone = document.getElementById("toneId");
  const preElement = document.querySelector("pre");

  const editButton = document.getElementById("editButtonId");
  const saveButton = document.getElementById("saveButtonId");
  const exportButton = document.getElementById("exportButtonId");
  const increaseToneButton = document.getElementById("increaseToneId");
  const decreaseToneButton = document.getElementById("decreaseToneId");

  // Referência ao documento do Firestore com base no ID capturado
  const docRef = doc(db, "musicas", songId);

  // Função que lida com a atualização da interface com os dados da música
  const updateSongData = (songData) => {
    title.innerHTML = songData.title;
    artist.innerHTML = songData.artist || 'Artista desconhecido'; // Exibe 'Artista desconhecido' se não houver dados
    tone.innerHTML = songData.tone;
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
  };

  increaseToneButton.addEventListener("click", () => {
    console.log("Subindo tom...");
    transposeChords(1);
  });

  decreaseToneButton.addEventListener("click", () => {
    console.log("Descendo tom...");
    transposeChords(-1);
  });

  editButton.addEventListener("click", () => {
    const newEditableState = !preElement.isContentEditable;
    preElement.contentEditable = newEditableState ? "true" : "false";
    
    // Se entrou em modo de edição, coloca o foco no elemento
    if (newEditableState) {
      preElement.focus();
    }
  });

  saveButton.addEventListener("click", async () => {
    const updatedContent = preElement.innerHTML;
    const updatedTone = tone.textContent.trim(); // Pega o tom atualizado exibido na página

    try {
      await setDoc(docRef, { letra: updatedContent, tone: updatedTone }, { merge: true }); // Salva tom e letra atualizados
      console.log("Documento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
    }
  });

  exportButton.addEventListener("click", () => {
    window.print();
  });
} else {
  console.error("ID da música não encontrado na URL.");
}
