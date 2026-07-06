let model;
let webcam;
let attendance = {};

async function startCamera() {
  try {
    console.log("Loading model...");

    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    console.log("Model loaded");

    webcam = new tmImage.Webcam(300, 300, true);

    await webcam.setup(); // 這裡會跳允許鏡頭
    await webcam.play();

    document.getElementById("camera").innerHTML = "";
    document.getElementById("camera").appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);

  } catch (err) {
    console.error("ERROR:", err);
    alert("Camera or Model failed to load. Check console.");
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let best = prediction.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );

  if (best.probability > 0.85) {

    document.getElementById("result").innerText =
      "Hello " + best.className;

    if (!attendance[best.className]) {
      attendance[best.className] = new Date().toLocaleTimeString();
      updateList();
    }
  }
}

function updateList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  for (let name in attendance) {
    const li = document.createElement("li");
    li.textContent = `${name} ✔ ${attendance[name]}`;
    list.appendChild(li);
  }
}

function exportCSV() {
  let csv = "Name,Time\n";

  for (let name in attendance) {
    csv += `${name},${attendance[name]}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
}
