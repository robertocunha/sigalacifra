const editButton = document.getElementById("editButtonId");
const preElement = document.querySelector("pre");

preElement.contentEditable = "false";

editButton.addEventListener("click", () => {
    const newEditableState = !preElement.isContentEditable;
    preElement.contentEditable = newEditableState ? "true" : "false";
});


