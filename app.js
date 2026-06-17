const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const resultGrid = document.getElementById("resultGrid");
const loading = document.getElementById("loading");

let selectedImageBase64 = null;

imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    selectedImageBase64 = reader.result.split(",")[1];

    imagePreview.innerHTML = `
      <img src="${reader.result}" alt="Imagen subida">
    `;
  };

  reader.readAsDataURL(file);
});

async function analyzeImage() {
  if (!selectedImageBase64) {
    alert("Primero subí una imagen.");
    return;
  }

  resultGrid.innerHTML = "";
  loading.classList.remove("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageBase64: selectedImageBase64
      })
    });

    const data = await response.json();
    console.log("RESPUESTA API:", data);

    loading.classList.add("hidden");

    if (!data.result) {
      alert("No se pudo obtener un análisis.");
      return;
    }

    const cleanText = data.result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanText);

    renderResults(result);

  } catch (error) {
    loading.classList.add("hidden");
    console.error(error);
    alert("Error analizando imagen: " + error.message);
  }
}

function renderResults(data) {
  resultGrid.innerHTML = `
    <div class="result-card">
      <span>Objeto detectado</span>
      <h3>${data.object || "No detectado"}</h3>
      <p>Confianza: ${data.confidence || "Media"}</p>
    </div>

    <div class="result-card">
      <span>💰 Precio estimado</span>
      <h3>${data.price || "Sin estimación"}</h3>
      <p>Valor aproximado recuperable en Argentina.</p>
    </div>

    <div class="result-card">
      <span>🔧 Cosas a rescatar</span>
      <h3>${data.rescue || "Sin datos"}</h3>
      <p>Partes o materiales que podrían tener valor.</p>
    </div>

    <div class="result-card">
      <span>🚀 Qué hacer</span>
      <h3>${data.action || "Sin recomendación"}</h3>
      <p>Decisión rápida según el análisis.</p>
    </div>

    <div class="result-card">
      <span>📸 Mejor foto</span>
      <h3>${data.nextPhoto || "Foto clara del objeto completo."}</h3>
      <p>Consejo para que la IA estime mejor.</p>
    </div>
  `;
}