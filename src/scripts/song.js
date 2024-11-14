// imports de css para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { app, analytics, db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "firebase/firestore";

const title = document.getElementById("titleId");
const artist = document.getElementById("artistId");
const tone = document.getElementById("toneId");
const preElement = document.querySelector("pre");

const editButton = document.getElementById("editButtonId");
const saveButton = document.getElementById("saveButtonId");
const exportButton = document.getElementById("exportButtonId");

const docRef = doc(db, "musicas", "evSBZkVYT2gpDywQHqCN");

// As duas linhas abaixo foram usadas apenas para enviar a primeira versão da música para o Firestore. O HTML naquele momento estava posicionado estaticamente no src/index.html.
// const letraComQuebras = preElement.innerHTML;
// await setDoc(docRef, { letra: letraComQuebras });

const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  title.innerHTML = docSnap.data().title;
  artist.innerHTML = docSnap.data().artist;
  tone.innerHTML = docSnap.data().tone;
  preElement.innerHTML = docSnap.data().letra;
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}

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
