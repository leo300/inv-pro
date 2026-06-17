let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let currentStream = null;
let facingMode = "environment";

let model = null;
let barcodeReader = null;

let aiMode = true;

// ================= START CAMERA =================
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }

  currentStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode }
  });

  video.srcObject = currentStream;
}

startCamera();

// ================= SWITCH CAMERA =================
document.getElementById("switchCam").onclick = async () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  await startCamera();
};

// ================= LOAD AI MODEL =================
async function loadAI() {
  model = await cocoSsd.load();
  console.log("AI model loaded");
}

loadAI();

// ================= BARCODE SCANNER =================
async function scanBarcode() {
  barcodeReader = new ZXing.BrowserMultiFormatReader();

  try {
    const result = await barcodeReader.decodeOnceFromVideoDevice(
      undefined,
      video
    );

    return {
      name: result.text,
      category: "Barcode Item"
    };

  } catch (err) {
    return null;
  }
}

// ================= AI DETECTION =================
async function scanAI() {
  if (!model) return null;

  const prediction = await model.detect(video);

  if (prediction.length === 0) return null;

  const obj = prediction[0];

  return {
    name: obj.class,
    category: "AI Detected"
  };
}

// ================= PUTER FALLBACK =================
async function scanPuter(image) {
  try {
    if (!window.puter?.ai) return null;

    const res = await puter.ai.img2txt(image);

    return {
      name: res?.object || res?.name || res?.text || "Unknown",
      category: res?.category || "AI"
    };

  } catch (e) {
    return null;
  }
}

// ================= MAIN SCAN =================
document.getElementById("scanBtn").onclick = async () => {

  const resultBox = document.getElementById("result");

  resultBox.innerText = "Scanning...";

  // 1. BARCODE FIRST (BEST ACCURACY)
  const barcode = await scanBarcode();
  if (barcode) {
    window.currentItem = barcode;
    resultBox.innerText = JSON.stringify(barcode, null, 2);
    return;
  }

  // 2. AI DETECTION (COCO-SSD)
  const ai = await scanAI();
  if (ai) {
    window.currentItem = ai;
    resultBox.innerText = JSON.stringify(ai, null, 2);
    return;
  }

  // 3. PUTER FALLBACK
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const image = canvas.toDataURL("image/jpeg");

  const fallback = await scanPuter(image);

  if (fallback) {
    window.currentItem = fallback;
    resultBox.innerText = JSON.stringify(fallback, null, 2);
    return;
  }

  resultBox.innerText = "No item detected";
};

// ================= MODE TOGGLE =================
document.getElementById("modeAI").onclick = () => {
  aiMode = true;
  alert("AI Mode Enabled");
};

document.getElementById("modeBarcode").onclick = () => {
  aiMode = false;
  alert("Barcode Mode Enabled");
};
