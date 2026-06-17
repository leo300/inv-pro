let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let stream;
let facing = "environment";
let model = null;

window.currentItem = null;
window.currentMode = "barcode";

// ================= SMART CATEGORY =================
function smartCategory(name) {
  name = name.toLowerCase();

  if (name.includes("cup") || name.includes("glass")) return "Kitchenware";
  if (name.includes("bottle") || name.includes("water")) return "Beverage";
  if (name.includes("phone") || name.includes("laptop")) return "Electronics";
  if (name.includes("food") || name.includes("snack")) return "Food";
  if (name.includes("qr")) return "QR Item";

  return "General";
}

// ================= CAMERA =================
async function startCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing }
  });

  video.srcObject = stream;
}

startCamera();

// ================= SWITCH CAMERA =================
document.getElementById("switchCam").onclick = async () => {
  facing = facing === "environment" ? "user" : "environment";
  await startCamera();
};

// ================= LOAD AI =================
cocoSsd.load().then(m => {
  model = m;
});

// ================= BARCODE =================
async function scanBarcode() {
  const reader = new ZXing.BrowserMultiFormatReader();

  try {
    const res = await reader.decodeOnceFromVideoDevice(undefined, video);

    return {
      name: res.text,
      category: smartCategory(res.text)
    };
  } catch {
    return null;
  }
}

// ================= QR CODE =================
async function scanQR() {
  const reader = new ZXing.BrowserQRCodeReader();

  try {
    const res = await reader.decodeOnceFromVideoDevice(undefined, video);

    return {
      name: res.text,
      category: "QR Item"
    };
  } catch {
    return null;
  }
}

// ================= AI =================
async function scanAI() {
  if (!model) return null;

  const preds = await model.detect(video);

  if (!preds.length) return null;

  const obj = preds[0];

  return {
    name: obj.class,
    category: smartCategory(obj.class)
  };
}

// ================= MANUAL =================
function manualAdd() {
  const name = prompt("Enter item name:");
  if (!name) return null;

  const cat = prompt("Category:") || "Manual";

  return { name, category: cat };
}

// ================= MODE UI =================
function setMode(mode) {
  window.currentMode = mode;

  document.getElementById("result").innerText =
    "Mode: " + mode.toUpperCase();
}

document.getElementById("modeBarcode").onclick = () => setMode("barcode");
document.getElementById("modeAI").onclick = () => setMode("ai");

setMode("barcode");

// ================= MAIN SCAN =================
document.getElementById("scanBtn").onclick = async () => {

  const box = document.getElementById("result");
  box.innerText = "Scanning...";

  window.currentItem = null;

  await new Promise(r => setTimeout(r, 800));

  let item = null;

  // ORDER: QR → BARCODE → AI → MANUAL
  item = await scanQR();
  if (!item) item = await scanBarcode();
  if (!item) item = await scanAI();

  if (!item) {
    if (confirm("Not detected. Add manually?")) {
      item = manualAdd();
    }
  }

  if (!item) {
    box.innerText = "No item detected";
    return;
  }

  window.currentItem = item;

  box.innerText = JSON.stringify(item, null, 2);
};
