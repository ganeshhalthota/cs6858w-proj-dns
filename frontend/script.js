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
  
  async function handleRequest(url, method, body, loadingMessage) {
    showSpinner();
    showToast(loadingMessage, "success");
  
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body) : undefined
      });
  
      const responseText = await res.text();
      showToast(res.ok ? responseText : `${responseText}`, res.ok ? "success" : "error");
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      hideSpinner();
    }
  }
  
  function getCredentials() {
    return {
      accId: document.getElementById("accId").value,
      priKey: document.getElementById("privateKey").value
    };
  }
  
  function registerDomain() {
    const { accId, priKey } = getCredentials();
    const domain = document.getElementById("regDomain").value;
    const ipv4 = document.getElementById("regIP").value;
  
    handleRequest("/register", "POST", { accId, priKey, domain, ipv4 }, "⏳ Registering domain...");
  }
  
  function resolveDomain() {
    const domain = document.getElementById("resDomain").value;
  
    showSpinner();
    showToast("🔍 Resolving domain...", "success");
    fetch("/resolve?domain=" + encodeURIComponent(domain))
      .then(res =>
        res.text().then(text => {
          showToast(res.ok ? text : `${text}`, res.ok ? "success" : "error");
        })
      )
      .catch(err => {
        showToast(`Error: ${err.message}`, "error");
      })
      .finally(() => {
        hideSpinner();
      });
  }
  
  function renewDomain() {
    const { accId, priKey } = getCredentials();
    const domain = document.getElementById("renewDomain").value;
  
    handleRequest("/renew", "POST", { accId, priKey, domain }, "🔄 Renewing domain...");
  }
  
  function initTx() {
    const { accId, priKey } = getCredentials();
    const domain = document.getElementById("initTxDomain").value;
    const newAccId = document.getElementById("initTxAccId").value;
  
    handleRequest("/init_transfer", "POST", { accId, priKey, domain, newAccId }, "🔁 Initiating transfer...");
  }
  
  function completeTx() {
    const { accId, priKey } = getCredentials();
    const domain = document.getElementById("completeTxDomain").value;
  
    handleRequest("/approve_transfer", "POST", { accId, priKey, domain }, "Approving transfer...");
  }
  