// Imports de CSS para uso do Webpack
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

import { db } from './firebaseConfig.js';
import { doc, onSnapshot, setDoc } from "firebase/firestore";

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

  // Função para transpor uma nota, preservando extensões e baixos
  function transposeNoteWithExtensions(chord, semitones) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatEquivalents = { "A#": "Bb", "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab" };

    const match = chord.match(/^([A-G][#b]?)(.*?)(\/[A-G][#b]?)?$/);
    if (!match) return chord;

    const [, root, extensions = "", slashWithBass = ""] = match;
    const slash = slashWithBass.charAt(0); // Mantém a barra "/"
    const bass = slashWithBass.slice(1); // Captura apenas a nota após a barra

    const transposedRoot = transposeChordWithoutBass(root, semitones, notes, flatEquivalents);
    const transposedBass = bass ? transposeChordWithoutBass(bass, semitones, notes, flatEquivalents) : "";

    return `${transposedRoot}${extensions}${slash}${transposedBass}`;
  }

  function transposeChordWithoutBass(note, semitones, notes, flatEquivalents) {
    const sharpNote = note.replace(/(Db|Eb|Gb|Ab|Bb)/g, match =>
      Object.entries(flatEquivalents).find(([sharp, flat]) => flat === match)[0]
    );
    let index = notes.indexOf(sharpNote);
    if (index === -1) return note;

    index = (index + semitones + notes.length) % notes.length;
    let transposedNote = notes[index];

    if (semitones < 0 && flatEquivalents[transposedNote]) {
      transposedNote = flatEquivalents[transposedNote];
    }

    return transposedNote;
  }

  const transposeChords = (steps) => {
    // Verifica se a letra está disponível antes de transpor
    if (preElement.innerHTML.trim() === "") {
      console.error("Não há conteúdo de letra para transpor.");
      return; // Se a letra estiver vazia, não faz nada
    }

    const boldElements = preElement.querySelectorAll("b");
    boldElements.forEach((b) => {
      const originalChord = b.textContent.trim();
      const transposedChord = transposeNoteWithExtensions(originalChord, steps);
      b.textContent = transposedChord;
    });

    const currentTone = tone.textContent.trim();
    const transposedTone = transposeNoteWithExtensions(currentTone, steps);
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
