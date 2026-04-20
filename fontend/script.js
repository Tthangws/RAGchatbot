async function send() {
    let input = document.getElementById("input").value;
    if (!input.trim()) return;

    addMessage("Bạn: " + input, "user");

    document.getElementById("input").value = "";

    let res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({question: input})
    });

    let data = await res.json();

    addMessage("Bot: " + data.answer, "bot");
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
fileInput.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        fileName.innerText = this.files[0].name;
    } else {
        fileName.innerText = "Chưa có file";
    }
});

// Allow sending message on Enter key
document.getElementById("input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        send();
    }
});
