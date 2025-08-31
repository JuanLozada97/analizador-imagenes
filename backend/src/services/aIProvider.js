import OpenAI from "openai";

/**
 * Normaliza cualquier salida a { tags: [{label, confidence}] }
 */
function normalizeTags(raw) {
  const out = { tags: [] };
  if (!raw) return out;

  const items = Array.isArray(raw) ? raw : raw.tags || [];
  for (const it of items) {
    if (!it) continue;
    const label = String(it.label ?? it.name ?? it.tag ?? "").trim();
    let conf = Number(it.confidence ?? it.score ?? it.prob ?? 0);
    if (!label) continue;
    if (!Number.isFinite(conf)) conf = 0;
    // clamp [0,1]
    conf = Math.max(0, Math.min(1, conf));
    out.tags.push({ label, confidence: conf });
  }
  return out;
}

/**
 * OpenAI Vision (gpt-4o-mini) — analiza imagen y produce JSON con tags
 */
async function analyzeWithOpenAI(buffer, mimeType, signal) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  // Convertimos imagen a base64 en formato data URL
  const b64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${b64}`;

  const response = await openai.responses.create(
    {
      model: "gpt-4.1-mini", // o gpt-4o-mini si prefieres
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Devuelve SOLO un JSON {\"tags\":[{\"label\":\"string\",\"confidence\":number}]}, con 3-10 etiquetas relevantes." },
            { type: "input_image", image_url: dataUrl }
          ]
        }
      ],
    },
    { signal }
  );

  // El texto viene consolidado en output_text
  let text = response.output_text || "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : { tags: [] };
  }

  return normalizeTags(parsed);
}

/**
 * Proveedor mock por si necesitas correr sin credenciales
 */
async function analyzeWithMock() {
  return {
    tags: [
      { label: "Ejemplo", confidence: 0.99 },
      { label: "Objeto", confidence: 0.88 },
      { label: "Escena", confidence: 0.77 },
    ],
  };
}

/**
 * Punto de entrada del proveedor de IA
 * @param {Buffer} buffer - bytes de la imagen
 * @param {string} mimeType - ej. image/png
 * @returns {Promise<{tags:{label:string,confidence:number}[]}>}
 */
export async function analyzeImage(buffer, mimeType) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  switch (provider) {
    case "openai":
      return analyzeWithOpenAI(buffer, mimeType);
    case "mock":
    default:
      return analyzeWithMock();
  }
}

export default { analyzeImage };
