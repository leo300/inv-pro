console.log("Inventory Pro Loaded");

// ================= GLOBAL STATE =================
window.currentItem = null;

// fallback safety check
function safe(el) {
  return document.getElementById(el);
}

// ================= DOM READY =================
window.addEventListener("DOMContentLoaded", () => {

  const resultBox = safe("result");

  // ensure inventory renders
  if (typeof renderInventory === "function") {
    renderInventory();
  }

  // ================= ADD BUTTON =================
  safe("addBtn").onclick = () => {
    if (!window.currentItem) {
      alert("No item scanned yet");
      return;
    }

    if (typeof addItem === "function") {
      addItem(window.currentItem);
    }

    resultBox.innerText = "Added ✔ " + JSON.stringify(window.currentItem);
  };

  // ================= REMOVE BUTTON =================
  safe("removeBtn").onclick = () => {
    if (!window.currentItem) {
      alert("No item scanned yet");
      return;
    }

    if (typeof removeItem === "function") {
      removeItem(window.currentItem);
    }

    resultBox.innerText = "Removed ✔ " + JSON.stringify(window.currentItem);
  };

  // ================= DELETE BUTTON =================
  safe("deleteBtn").onclick = () => {
    if (typeof deleteSelected === "function") {
      deleteSelected();
    }
  };

  // ================= SEARCH LIVE HOOK =================
  safe("search").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    document.querySelectorAll("#tableBody tr").forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";
    });
  });

  // ================= EXPORT SAFETY =================
  safe("exportExcel").onclick = () => {
    if (typeof inventory === "undefined") {
      alert("Inventory not ready");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(inventory);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    XLSX.writeFile(wb, "inventory.xlsx");
  };

  // ================= CAMERA SAFETY CHECK =================
  if (!navigator.mediaDevices) {
    alert("Camera not supported in this browser");
  }

  console.log("System initialized ✔");
});
