console.log("App Controller Loaded");

// GLOBAL STATE
window.currentItem = null;
window.currentMode = "barcode";

// DOM
const resultBox = document.getElementById("result");
const scanBtn = document.getElementById("scanBtn");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");

// ================= MODE SYNC =================
function setMode(mode) {
  window.currentMode = mode;

  document.getElementById("modeBarcode").style.background =
    mode === "barcode" ? "#22c55e" : "#1f2a44";

  document.getElementById("modeAI").style.background =
    mode === "ai" ? "#22c55e" : "#1f2a44";

  resultBox.innerText = "Mode: " + mode;
}

// ================= BUTTONS =================
document.getElementById("modeBarcode").onclick = () => setMode("barcode");
document.getElementById("modeAI").onclick = () => setMode("ai");

// ================= SCAN FLOW =================
scanBtn.onclick = async () => {

  resultBox.innerText = "Scanning...";

  window.currentItem = null;

  let item = null;

  // WAIT FOR CAMERA STABILITY
  await new Promise(r => setTimeout(r, 800));

  if (window.currentMode === "barcode") {
    if (window.scanBarcode) {
      item = await window.scanBarcode();
    }
  }

  if (window.currentMode === "ai") {
    if (window.scanAI) {
      item = await window.scanAI();
    }
  }

  // fallback manual
  if (!item) {
    const ok = confirm("Not detected. Add manually?");
    if (ok) {
      const name = prompt("Item name?");
      if (!name) return;

      item = {
        name,
        category: "Manual"
      };
    }
  }

  if (!item) {
    resultBox.innerText = "No item detected";
    return;
  }

  window.currentItem = item;

  resultBox.innerText = JSON.stringify(item, null, 2);
};

// ================= INVENTORY BUTTONS =================
addBtn.onclick = () => {
  if (!window.currentItem) return alert("Scan first");
  window.addItem?.(window.currentItem);
};

removeBtn.onclick = () => {
  if (!window.currentItem) return alert("Scan first");
  window.removeItem?.(window.currentItem);
};

setMode("barcode");
