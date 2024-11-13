import { app, db } from './firebaseConfig.js';
import { doc, setDoc } from "firebase/firestore";

const saveButton = document.getElementById("saveSongButton");

saveButton.addEventListener("click", async () => {
    const title = document.getElementById("songTitle").value;
    const artist = document.getElementById("artistName").value;
    const content = document.getElementById("songContent").value;

    // Aqui você pode gerar um ID ou deixar o Firestore criar automaticamente
    const docRef = doc(db, "musicas", title); // usando o título como ID, ou gere outro ID único

    try {
        await setDoc(docRef, {
            title: title,
            artist: artist,
            letra: content
        });
        alert("Canção salva com sucesso!");
    } catch (e) {
        console.error("Erro ao salvar canção: ", e);
    }
});
