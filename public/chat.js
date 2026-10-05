const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const messagesElement = document.querySelector("#messages");
const leadForm = document.querySelector("#lead-form");
const leadStatus = document.querySelector("#lead-status");

const history = [];

function addMessage(role, content) {
  const message = document.createElement("div");
  message.className = `message ${role}-message`;
  message.textContent = content;
  messagesElement.append(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;

  chatInput.value = "";
  addMessage("user", content);
  history.push({ role: "user", content });
  const recentHistory = history.slice(-11);

  if (recentHistory.length > 1 && recentHistory[0].role === "assistant") {
    recentHistory.shift();
  }
  chatForm.querySelector("button").disabled = true;

  try {
    const response = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(recentHistory),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "The assistant is unavailable right now.");
    }

    addMessage("assistant", payload.reply);
    history.push({ role: "assistant", content: payload.reply });
    if (payload.leadReady) {
      leadStatus.textContent = "Your project details seem complete; you can submit the form below to send them to the studio.";
    }
  } catch (error) {
    addMessage("assistant", error.message);
    history.pop();
  } finally {
    chatForm.querySelector("button").disabled = false;
    chatInput.focus();
  }
});

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(leadForm);
  const payload = {
    name: data.get("name"),
    email: data.get("email"),
    whatsapp: data.get("whatsapp") || undefined,
    need: data.get("need"),
    context: data.get("context"),
    consent: data.get("consent") === "on",
  };

  leadStatus.textContent = "Sending your details...";
  try {
    const response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "We couldn't submit your details.");
    }

    leadStatus.textContent = `Thanks for reaching out. Your reference is ${result.id}.`;
    leadForm.reset();
  } catch (error) {
    leadStatus.textContent = error.message;
  }
});
