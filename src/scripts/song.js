// Imports de CSS para uso do Webpack
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  // Busca e exibe os dados da música
  const fetchSongData = async () => {
    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const songData = docSnap.data();
        title.innerHTML = songData.title;
        artist.innerHTML = songData.artist || 'Artista desconhecido'; // Exibe 'Artista desconhecido' se não houver dados
        tone.innerHTML = songData.tone;
        preElement.innerHTML = songData.letra;
      } else {
        console.log("Nenhum documento encontrado!");
      }
    } catch (error) {
      console.error("Erro ao buscar o documento:", error);
    }
  };

  // Executa a função para buscar os dados da música
  fetchSongData();

  preElement.contentEditable = "false";

  // Função para transpor uma nota, preservando extensões
  function transposeNoteWithExtensions(chord, semitones) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatEquivalents = { "A#": "Bb", "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab" };

    // Divide o acorde em raiz e extensões usando regex
    const match = chord.match(/^([A-G][#b]?)(.*)$/); // Ex: "G#m7(11)" -> ["G#", "m7(11)"]
    if (!match) return chord; // Retorna o acorde como está se não for reconhecido.

    const [, root, extensions] = match;

    // Normaliza bemóis para sustenidos
    const sharpNote = root.replace(/(Db|Eb|Gb|Ab|Bb)/g, match =>
        Object.entries(flatEquivalents).find(([sharp, flat]) => flat === match)[0]
    );

    let index = notes.indexOf(sharpNote);
    if (index === -1) return chord; // Se não for uma nota válida, retorna o acorde original.

    // Calcula o índice transposto
    index = (index + semitones + notes.length) % notes.length;
    let transposedNote = notes[index];

    // Se descendo (semitones < 0), prefere bemóis
    if (semitones < 0 && flatEquivalents[transposedNote]) {
        transposedNote = flatEquivalents[transposedNote];
    }

    return transposedNote + extensions; // Junta a nota transposta com as extensões
  }

  // Função para transpor cifras no texto
  const transposeChords = (steps) => {
    const boldElements = preElement.querySelectorAll("b");
    boldElements.forEach((b) => {
      const originalChord = b.textContent.trim();
      const transposedChord = transposeNoteWithExtensions(originalChord, steps);
      b.textContent = transposedChord;
    });
  };

  // Event listeners para os botões
  increaseToneButton.addEventListener("click", () => {
    console.log("Subindo tom...");
    transposeChords(1); // Sobe um semitom
  });

  decreaseToneButton.addEventListener("click", () => {
    console.log("Descendo tom...");
    transposeChords(-1); // Desce um semitom
  });

  editButton.addEventListener("click", () => {
    const newEditableState = !preElement.isContentEditable;
    preElement.contentEditable = newEditableState ? "true" : "false";
  });

  saveButton.addEventListener("click", async () => {
    const updatedContent = preElement.innerHTML; // pega o conteúdo atualizado do <pre>

    try {
      await setDoc(docRef, { letra: updatedContent }, { merge: true }); // salva o conteúdo atualizado no Firestore
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
