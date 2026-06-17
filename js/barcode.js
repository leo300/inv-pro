let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

window.currentMode = "barcode";
window.currentItem = null;

let stream;
let facing = "environment";
let model = null;

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
  console.log("COCO-SSD ready");
});

// ================= MODE UI =================
function setModeUI(mode) {
  window.currentMode = mode;

  document.getElementById("modeBarcode").style.background =
    mode === "barcode" ? "#22c55e" : "#1f2a44";

  document.getElementById("modeAI").style.background =
    mode === "ai" ? "#22c55e" : "#1f2a44";

  document.getElementById("result").innerText =
    "Mode: " + mode.toUpperCase();
}

document.getElementById("modeBarcode").onclick = () => setModeUI("barcode");
document.getElementById("modeAI").onclick = () => setModeUI("ai");

setModeUI("barcode");

// ================= BARCODE SCAN =================
async function scanBarcode() {
  const codeReader = new ZXing.BrowserMultiFormatReader();

  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, video);

    return {
      name: result.text,
      category: "Barcode"
    };
  } catch {
    return null;
  }
}

// ================= AI SCAN =================
async function scanAI() {
  if (!model) return null;

  const predictions = await model.detect(video);

  if (!predictions.length) return null;

  const obj = predictions[0];

  return {
    name: obj.class,
    category: "AI Vision"
  };
}

// ================= MANUAL FALLBACK =================
function manualAdd() {
  const name = prompt("Enter item name:");
  if (!name) return null;

  const category = prompt("Enter category:") || "Manual";

  return { name, category };
}

// ================= MAIN SCAN =================
document.getElementById("scanBtn").onclick = async () => {
  const resultBox = document.getElementById("result");

  resultBox.innerText = "Scanning...";

  window.currentItem = null;

  // FORCE VIDEO READY
  await new Promise(r => setTimeout(r, 1200));

  let item = null;

  // MODE LOGIC
  if (window.currentMode === "barcode") {
    item = await scanBarcode();
  }

  if (window.currentMode === "ai") {
    item = await scanAI();
  }

  // IF NOTHING FOUND → manual fallback
  if (!item) {
    resultBox.innerText = "Not detected → Manual mode";

    if (confirm("Item not detected. Add manually?")) {
      item = manualAdd();
    }
  }

  if (!item) {
    resultBox.innerText = "No item added";
    return;
  }

  window.currentItem = item;

  resultBox.innerText = JSON.stringify(item, null, 2);
};
