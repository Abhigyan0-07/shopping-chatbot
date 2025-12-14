const CHAT_ENDPOINT = "http://localhost:8000/api/chat";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;

  addMessage(`You: ${msg}`, "user");
  userInput.value = "";

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    addMessage(`Bot: ${data.reply}`, "bot");
  } catch (error) {
    addMessage("Bot: Error connecting to server.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
