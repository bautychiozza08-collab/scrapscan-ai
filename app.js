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

    loading.classList.add("hidden");

    if (!data.result) {
      alert("No se pudo obtener un análisis.");
      console.log(data);
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
    alert("Error analizando imagen.");
    console.error(error);
  }
}

function renderResults(data) {
  resultGrid.innerHTML = `
    <div class="result-card">
      <span>Objeto detectado</span>
      <h3>${data.object || "No detectado"}</h3>
      <p>La IA identificó el tipo general del objeto.</p>
    </div>

    <div class="result-card">
      <span>Materiales útiles</span>
      <h3>${data.materials || "Sin datos"}</h3>
      <p>Materiales potencialmente recuperables.</p>
    </div>

    <div class="result-card">
      <span>Componentes</span>
      <h3>${data.components || "Sin datos"}</h3>
      <p>Partes que podrían tener valor para reciclaje.</p>
    </div>

    <div class="result-card">
      <span>Valor estimado</span>
      <h3>${data.value || "Sin estimación"}</h3>
      <p>Estimación inicial según materiales detectados.</p>
    </div>

    <div class="result-card">
      <span>Recuperación</span>
      <h3>${data.recovery || "Sin datos"}</h3>
      <p>Porcentaje aproximado de material aprovechable.</p>
    </div>

    <div class="result-card">
      <span>Recomendación</span>
      <h3>♻️ Reciclar</h3>
      <p>${data.recommendation || "Separar materiales y evaluar componentes útiles."}</p>
    </div>
  `;
}