// imports de css para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { app, analytics, db } from './firebaseConfig.js';
import { doc, getDoc } from "firebase/firestore";

const docRef = doc(db, "musicas", "evSBZkVYT2gpDywQHqCN");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
  console.log("letra:", docSnap.data().letra);
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}

localStorage.clear();

const preElement = document.querySelector("pre");
const editButton = document.getElementById("editButtonId");
const saveButton = document.getElementById("saveButtonId");
const exportButton = document.getElementById("exportButtonId");

let key = 'song';
let songContent = localStorage.getItem(key);

if (songContent && songContent.length > 0) {
    preElement.innerHTML = songContent;
} else {
    console.log("local storage is empty");
}

preElement.contentEditable = "false";

editButton.addEventListener("click", () => {
    const newEditableState = !preElement.isContentEditable;
    preElement.contentEditable = newEditableState ? "true" : "false";
});

saveButton.addEventListener("click", () => {
    songContent = preElement.innerHTML;
    localStorage.setItem(key, songContent);

    console.clear();
    console.log(localStorage.getItem(key));
});

exportButton.addEventListener("click", () => {
    window.print();
});
