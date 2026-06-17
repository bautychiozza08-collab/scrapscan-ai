export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { imageBase64 } = req.body;

    const prompt = `
Actuá como un experto en reciclaje, chatarra, electrodomésticos usados, electrónica usada y reventa de componentes en Argentina.

Analizá el objeto de la imagen aunque la foto no sea perfecta.
Si no estás 100% seguro, estimá usando pistas visuales.
No digas "no puedo". Respondé con lo más probable.

Respondé EXCLUSIVAMENTE en JSON válido.

Formato exacto:

{
  "object": "",
  "confidence": "",
  "price": "",
  "rescue": "",
  "action": "",
  "nextPhoto": ""
}

Reglas:
- object = qué objeto parece ser.
- confidence = Alta, Media o Baja.
- price = valor estimado en pesos argentinos.
- rescue = cosas valiosas para rescatar, en una frase corta.
- action = qué conviene hacer, simple y directo.
- nextPhoto = qué foto debería sacar para mejorar el análisis.

No uses texto técnico largo.
No expliques de más.
No uses euros ni dólares.
No escribas markdown.
No agregues texto fuera del JSON.

Ejemplo:

{
  "object": "Heladera antigua",
  "confidence": "Alta",
  "price": "$25.000 - $60.000",
  "rescue": "Compresor, cobre, aluminio, cables y chapa.",
  "action": "No la tires. Conviene venderla entera o desarmarla por partes.",
  "nextPhoto": "Sacá una foto de atrás donde se vea el motor o compresor."
}
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
                { text: prompt },
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