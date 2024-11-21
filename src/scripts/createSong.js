import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// imports de css para uso do Webpack 
import '../css/print.css';
import '../css/style.css';

import { app, db } from './firebaseConfig.js';
import { doc, setDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

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

    // Se a posição estiver em branco, define como a última
    if (!position) {
        position = await getLastPosition() + 10; // Definir a última posição + 10
    } else {
        // Verificar se a posição já está em uso
        const positionConflict = await checkPositionConflict(position);
        if (positionConflict) {
            // Se houver conflito, encontra a próxima posição livre
            position = await getNextFreePosition(position);
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

// Função para obter a última posição
async function getLastPosition() {
    const q = query(collection(db, "musicas"), orderBy("position", "desc"));
    const querySnapshot = await getDocs(q);
    const lastDoc = querySnapshot.docs[0];
    return lastDoc ? lastDoc.data().position : 0;
}

// Função para verificar se a posição já está em uso
async function checkPositionConflict(position) {
    const q = query(collection(db, "musicas"), where("position", "==", position));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0; // Retorna true se a posição já estiver em uso
}

// Função para encontrar a próxima posição livre
async function getNextFreePosition(position) {
    let newPosition = position;
    let positionConflict = await checkPositionConflict(newPosition);
    
    // Se houver conflito, procura a próxima posição livre
    while (positionConflict) {
        newPosition += 10; // Aumenta a posição em 10
        positionConflict = await checkPositionConflict(newPosition);
    }
    
    return newPosition;
}
