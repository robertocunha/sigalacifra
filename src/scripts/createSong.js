// imports de css para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { app, db } from './firebaseConfig.js';
import { doc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";

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
    let position = Number(positionInput.value);
    const active = activeInput.checked;
    const lyrics = lyricsInput.value;

    console.log("formData: ", title, artist, tone, position, active, lyrics);

    // Caso o campo posição esteja vazio, definimos a posição como a última
    if (isNaN(position) || position === 0) {
        try {
            // Query para buscar o maior valor de posição existente
            const q = query(collection(db, "musicas"), orderBy("position", "desc"));
            const querySnapshot = await getDocs(q);
            
            // Se existirem músicas, pegamos o maior valor e somamos 10
            if (!querySnapshot.empty) {
                const lastDoc = querySnapshot.docs[0];
                const lastPosition = lastDoc.data().position;
                position = lastPosition + 10; // Espaçamento de 10
            } else {
                // Se não houver músicas, a posição será 10 (início da lista)
                position = 10;
            }
        } catch (e) {
            console.error("Erro ao buscar a última posição: ", e);
            position = 10; // Definir posição padrão em caso de erro
        }
    }

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
