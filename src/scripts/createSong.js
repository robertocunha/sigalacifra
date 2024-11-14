// imports de css para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { app, db } from './firebaseConfig.js';
import { doc, setDoc, collection } from "firebase/firestore";

// Referências aos elementos
const form = document.getElementById("formId");
const saveButton = document.getElementById("saveButtonId");
const titleInput = document.getElementById("titleId");
const artistInput = document.getElementById("artistId");
const toneInput = document.getElementById("toneId");
const positionInput = document.getElementById("positionId");
const activeInput = document.getElementById("activeId");
const lyricsInput = document.getElementById("lyricsId");

saveButton.addEventListener("click", async () => {
    // Obtenção dos valores dos inputs
    const title = titleInput.value;
    const artist = artistInput.value;
    const tone = toneInput.value;
    const position = Number(positionInput.value);
    const active = activeInput.checked;
    const lyrics = lyricsInput.value;

    console.log("formData: ", title, artist, tone, position, active, lyrics);

    // Referência para o documento, deixando o Firestore gerar o ID automaticamente
    const docRef = doc(collection(db, "musicas"));

    try {
        await setDoc(docRef, {
            title: title,
            artist: artist,
            tone: tone,
            position: position,
            active: active,
            letra: lyrics
        });
        alert("Canção salva com sucesso!");
        form.reset(); // Limpa o formulário após o salvamento
    } catch (e) {
        console.error("Erro ao salvar canção: ", e);
    }
});
