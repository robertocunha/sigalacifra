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
