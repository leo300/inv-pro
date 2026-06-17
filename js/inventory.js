let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

let selectedIndex = null;

// ================= SAVE =================
function save() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

// ================= RENDER =================
function renderInventory() {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  inventory.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.qty}</td>
      <td>
        <button onclick="editItem(${index})">✏ Edit</button>
        <button onclick="deleteItem(${index})">🗑 Delete</button>
      </td>
    `;

    table.appendChild(row);
  });

  save();
}

// ================= ADD =================
function addItem(item) {
  if (!item) return;

  let existing = inventory.find(i => i.name === item.name);

  if (existing) {
    existing.qty += 1;
  } else {
    inventory.push({
      name: item.name,
      category: item.category || "General",
      qty: 1
    });
  }

  renderInventory();
}

// ================= REMOVE =================
function removeItem(item) {
  if (!item) return;

  let existing = inventory.find(i => i.name === item.name);

  if (existing) {
    existing.qty -= 1;

    if (existing.qty <= 0) {
      inventory = inventory.filter(i => i.name !== item.name);
    }
  }

  renderInventory();
}

// ================= DELETE =================
window.deleteItem = (index) => {
  inventory.splice(index, 1);
  renderInventory();
};

// ================= EDIT =================
window.editItem = (index) => {
  const item = inventory[index];

  const newName = prompt("Edit name:", item.name);
  const newCategory = prompt("Edit category:", item.category);
  const newQty = prompt("Edit quantity:", item.qty);

  if (newName !== null) item.name = newName;
  if (newCategory !== null) item.category = newCategory;
  if (newQty !== null) item.qty = Number(newQty);

  renderInventory();
};

// ================= SEARCH =================
document.getElementById("search").addEventListener("input", (e) => {
  const val = e.target.value.toLowerCase();

  document.querySelectorAll("#tableBody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(val)
      ? ""
      : "none";
  });
});

// ================= EXPORT =================
document.getElementById("exportExcel").onclick = () => {
  const ws = XLSX.utils.json_to_sheet(inventory);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, "inventory.xlsx");
};

// INIT
renderInventory();

// expose functions globally
window.addItem = addItem;
window.removeItem = removeItem;
