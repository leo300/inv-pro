let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

let selectedIndex = null;
let currentItem = null;

// ================= SAVE =================
function saveInventory() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

// ================= RENDER TABLE =================
function renderInventory() {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  inventory.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.qty}</td>
      <td><button onclick="selectItem(${index})">Select</button></td>
    `;

    if (selectedIndex === index) {
      row.style.background = "#1f3b82";
    }

    table.appendChild(row);
  });

  saveInventory();
}

// ================= SELECT ITEM =================
window.selectItem = (index) => {
  selectedIndex = index;
  renderInventory();
};

// ================= FIND ITEM =================
function findItem(name) {
  return inventory.find(i => i.name === name);
}

// ================= ADD ITEM =================
function addItem(item) {
  if (!item) return;

  let existing = findItem(item.name);

  if (existing) {
    existing.qty += 1;
  } else {
    inventory.push({
      name: item.name,
      category: item.category || "Unknown",
      qty: 1
    });
  }

  renderInventory();
}

// ================= REMOVE ITEM =================
function removeItem(item) {
  if (!item) return;

  let existing = findItem(item.name);

  if (existing) {
    existing.qty -= 1;

    if (existing.qty <= 0) {
      inventory = inventory.filter(i => i.name !== item.name);
      selectedIndex = null;
    }
  }

  renderInventory();
}

// ================= DELETE SELECTED =================
function deleteSelected() {
  if (selectedIndex === null) return;

  inventory.splice(selectedIndex, 1);
  selectedIndex = null;

  renderInventory();
}

// ================= BUTTON HOOKS =================
document.getElementById("addBtn").onclick = () => {
  addItem(currentItem);
};

document.getElementById("removeBtn").onclick = () => {
  removeItem(currentItem);
};

document.getElementById("deleteBtn").onclick = () => {
  deleteSelected();
};

// ================= SEARCH =================
document.getElementById("search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach(row => {
    row.style.display =
      row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";
  });
});

// ================= EXCEL EXPORT =================
document.getElementById("exportExcel").onclick = () => {
  const ws = XLSX.utils.json_to_sheet(inventory);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Inventory");

  XLSX.writeFile(wb, "inventory.xlsx");
};

// ================= INIT =================
renderInventory();
