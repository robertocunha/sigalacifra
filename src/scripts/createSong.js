import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos
import 'bootstrap'; // Funcionalidades JS (requer Popper.js)

// imports de css para uso do Webpack 
import '../css/print.css';
import '../css/style.css';

import { app, db } from './firebaseConfig.js';
import { doc, setDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { parseChordSheet } from './chordParser.js';

// Referências aos elementos
const form = document.getElementById("formId");
const saveButton = document.getElementById("saveButtonId");
const cancelButton = document.getElementById("cancelButtonId");
const titleInput = document.getElementById("titleId");
const artistInput = document.getElementById("artistId");
const toneInput = document.getElementById("toneId");
const activeInput = document.getElementById("activeId");
const lyricsInput = document.getElementById("lyricsId");

// Botão Cancelar - volta para a página anterior ou index.html
cancelButton.addEventListener("click", () => {
    // Verifica se há histórico de navegação
    if (document.referrer && (document.referrer.includes('index.html') || document.referrer.includes('archived.html'))) {
        window.history.back();
    } else {
        // Fallback para index.html se não houver referrer válido
        window.location.href = "index.html";
    }
});

saveButton.addEventListener("click", async () => {
    // Obtenção dos valores dos inputs
    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();
    const tone = toneInput.value.trim();
    const active = activeInput.checked;
    const lyricsRaw = lyricsInput.value.trim();
    
    // Validação básica
    if (!title || !artist || !tone || !lyricsRaw) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    
    // Disable button to prevent double submission
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";
    
    // Convert plain text to HTML with chords wrapped in <b> tags
    const lyrics = parseChordSheet(lyricsRaw);

    // Define position as last + 10
    const position = await getLastPosition() + 10;

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
        // Redireciona para visualizar a música criada
        window.location.href = `song.html?id=${docRef.id}`;
    } catch (e) {
        console.error("Erro ao salvar canção: ", e);
        alert("Erro ao salvar a canção. Tente novamente.");
        saveButton.disabled = false;
        saveButton.textContent = "Salvar Canção";
    }
});

// Função para obter a última posição
async function getLastPosition() {
    const q = query(collection(db, "musicas"), orderBy("position", "desc"));
    const querySnapshot = await getDocs(q);
    const lastDoc = querySnapshot.docs[0];
    return lastDoc ? lastDoc.data().position : 0;
}
