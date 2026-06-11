export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    const { imageBase64 } = req.body;

    const prompt = `
Analiza esta imagen.

Responde EXCLUSIVAMENTE en JSON.

Formato:

{
  "object": "",
  "materials": "",
  "components": "",
  "value": "",
  "recovery": "",
  "recommendation": ""
}

Debes:

- Identificar el objeto.
- Detectar materiales recuperables.
- Detectar componentes útiles.
- Estimar valor recuperable.
- Estimar porcentaje de recuperación.
- Recomendar qué hacer con él.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    res.status(200).json({
      result: text
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
}