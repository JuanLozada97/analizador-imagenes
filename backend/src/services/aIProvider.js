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

  // Convertimos a base64 para el input_image binario
  const b64 = buffer.toString("base64");

  const system = "Eres un asistente que etiqueta imágenes de manera breve y precisa.";
  const user = [
    {
      type: "input_text",
      text:
        "Devuelve SOLO un JSON con el formato {\"tags\":[{\"label\":\"string\",\"confidence\":number}]}. " +
        "Incluye de 3 a 10 etiquetas relevantes. confidence entre 0 y 1. Sin texto adicional.",
    },
    {
      type: "input_image",
      image_data: { data: b64, mime_type: mimeType || "image/png" },
    },
  ];

  // Timeout/abort controller por robustez
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000); // 25s
  try {
    const resp = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      { signal: signal ?? controller.signal }
    );

    const text = resp.choices?.[0]?.message?.content?.trim() || "";
    // Parseo defensivo del JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Heurística: intenta extraer bloque JSON si vino con texto extra
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { tags: [] };
    }
    return normalizeTags(parsed);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("AI request timeout");
    }
    throw new Error(`OpenAI error: ${err.message || String(err)}`);
  } finally {
    clearTimeout(timeout);
  }
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
