const preElement = document.querySelector("pre");
const editButton = document.getElementById("editButtonId");
const saveButton = document.getElementById("saveButtonId");

const key = 'song';
let songContent = localStorage.getItem(key);

// Carrega conteúdo inicial do localStorage, se existir
function loadContent() {
    if (songContent) {
        preElement.innerHTML = songContent;
    } else {
        console.log("Local storage is empty");
    }
}

loadContent();
preElement.contentEditable = "false";
saveButton.disabled = true; // Desativa o botão Salvar inicialmente

editButton.addEventListener("click", () => {
    const newEditableState = !preElement.isContentEditable;
    preElement.contentEditable = newEditableState ? "true" : "false";
    
    saveButton.disabled = !newEditableState; // Ativa ou desativa o botão Salvar com base no estado
});

saveButton.addEventListener("click", () => {
    songContent = preElement.innerHTML;
    localStorage.setItem(key, songContent);

    console.clear();
    console.log("Saved content:", localStorage.getItem(key));
});
