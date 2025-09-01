export type Tag = { label: string; confidence: number };
export type AnalyzeResponse = { tags: Tag[] };

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function analyzeImage(file: File, signal?: AbortSignal): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: form,
    signal,
  });

  // Intenta leer JSON siempre (incluso en errores)
  let payload: any = null;
  try { payload = await res.json(); } catch { /* puede no venir JSON en errores raros */ }

  if (!res.ok) {
    const msg = payload?.error ?? `Analyze failed (${res.status})`;
    throw new Error(msg);
  }

  return payload as AnalyzeResponse;
}
