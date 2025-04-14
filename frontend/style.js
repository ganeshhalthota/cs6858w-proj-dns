function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function showSpinner() {
  document.getElementById("spinner-overlay").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("spinner-overlay").style.display = "none";
}
