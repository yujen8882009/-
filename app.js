let model, webcam;
let attendance = {};

async function startCamera() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera").appendChild(webcam.canvas);

  loop();
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);

  if (best.probability > 0.85) {
    document.getElementById("result").innerText =
      `Hello ${best.className}`;

    if (!attendance[best.className]) {
      attendance[best.className] = new Date().toLocaleTimeString();
      updateList();
    }
  }
}

function updateList() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  for (let name in attendance) {
    let li = document.createElement("li");
    li.innerText = `${name} ✔ ${attendance[name]}`;
    list.appendChild(li);
  }
}

function exportCSV() {
  let csv = "Name,Time\n";
  for (let name in attendance) {
    csv += `${name},${attendance[name]}\n`;
  }

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
}
