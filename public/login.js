function openChat() {
  document.getElementById("chat-panel").style.width = "250px";
}

function closeChat() {
  document.getElementById("chat-panel").style.width = "0px";
}

var chat_open = false;

function toggleChat() {
  if (chat_open == false) {
    document.getElementById("chat-panel").style.width = "250px";
    chat_open = true;
  } else {
    document.getElementById("chat-panel").style.width = "15px";
    chat_open = false;
  }
}
