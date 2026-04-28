async function send() {
    let inputEl = document.getElementById("input");
    let input = inputEl.value.trim();
    let fileInput = document.getElementById("file");
    let file = fileInput.files[0];

    if (!input && !file) return;

    if (file) {
        addFileMessage(file);
    }
    if (input) {
        addMessage("Bạn: " + input, "user");
    }

    inputEl.value = "";

    if (file) {
        clearSelectedFile();

        let formData = new FormData();
        formData.append("file", file);

        let uploadRes = await fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formData
        });

        if (!uploadRes.ok) {
            alert("Upload lỗi: " + uploadRes.status + " " + uploadRes.statusText);
            return;
        }

        let uploadResult = null;
        try {
            uploadResult = await uploadRes.json();
        } catch (e) {
            // Server trả về không phải JSON hoặc không trả dữ liệu
        }

        addMessage("Bot: " + (uploadResult?.message || "File đã được tải lên."), "bot");
    }

    if (input) {
        let res = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({question: input})
        });

        let data = await res.json();
        addMessage("Bot: " + data.answer, "bot");
    }
}

function getFileIconClass(fileName) {
    let ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'doc':
        case 'docx':
            return 'fa-file-word';
        case 'xls':
        case 'xlsx':
            return 'fa-file-excel';
        case 'ppt':
        case 'pptx':
            return 'fa-file-powerpoint';
        case 'pdf':
            return 'fa-file-pdf';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            return 'fa-file-image';
        default:
            return 'fa-file-lines';
    }
}

function addFileMessage(file) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "message user file";

    let fileCard = document.createElement("div");
    fileCard.className = "file-card";

    let iconDiv = document.createElement("div");
    iconDiv.className = "file-card-icon";
    iconDiv.innerHTML = `<i class="fas ${getFileIconClass(file.name)}"></i>`;

    let detailsDiv = document.createElement("div");
    detailsDiv.className = "file-card-details";

    let titleDiv = document.createElement("div");
    titleDiv.className = "file-card-title";
    titleDiv.innerText = file.name;

    let typeDiv = document.createElement("div");
    typeDiv.className = "file-card-type";
    typeDiv.innerText = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    detailsDiv.appendChild(titleDiv);
    detailsDiv.appendChild(typeDiv);
    fileCard.appendChild(iconDiv);
    fileCard.appendChild(detailsDiv);
    messageDiv.appendChild(fileCard);

    let chatBox = document.getElementById("chat-box");
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, cls) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "message " + cls;

    let avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    if (cls === "user") {
        avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    }

    let textDiv = document.createElement("div");
    textDiv.className = "text";
    textDiv.innerText = text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(textDiv);

    let chatBox = document.getElementById("chat-box");
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function upload() {
    let file = document.getElementById("file").files[0];
    if (!file) {
        alert("Vui lòng chọn file PDF hoặc ảnh!");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    let res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        alert("Upload lỗi: " + res.status + " " + res.statusText);
        return;
    }

    let result = null;
    try {
        result = await res.json();
    } catch (e) {
        // Server trả về không phải JSON hoặc không trả dữ liệu
    }

    addMessage("Bạn: Đã gửi file " + file.name, "user");
    addMessage("Bot: " + (result?.message || "File đã được tải lên."), "bot");

    document.getElementById("file").value = "";
    document.getElementById("file-name").innerText = "Chưa có file";
}

// Show selected file name
const fileInput = document.getElementById("file");
const fileName = document.getElementById("file-name");
const clearFileBtn = document.getElementById("clear-file-btn");
const filePreview = document.querySelector(".file-preview");
fileInput.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        fileName.innerText = this.files[0].name;
        clearFileBtn.style.display = "inline-flex";
        filePreview.style.display = "flex";
    } else {
        clearSelectedFile();
    }
});

function clearSelectedFile() {
    fileInput.value = "";
    clearFileBtn.style.display = "none";
    filePreview.style.display = "none";
    clearSelectedFileDisplay();
}

function clearSelectedFileDisplay() {
    fileName.innerText = "Chưa có file";
}

// Allow sending message on Enter key
document.getElementById("input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        send();
    }
});
