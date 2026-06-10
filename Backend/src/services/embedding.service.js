const NOMIC_API_KEY = process.env.NOMIC_API_KEY;
const NOMIC_URL = "https://api-atlas.nomic.ai/v1/embedding/text";

async function embedTexts(texts, taskType = "search_document") {
  if (!NOMIC_API_KEY) throw new Error("NOMIC_API_KEY no configurado");

  const res = await fetch(NOMIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NOMIC_API_KEY}`,
    },
    body: JSON.stringify({
      model: "nomic-embed-text-v1.5",
      texts: texts.map((t) => `${taskType}: ${t}`),
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[Nomic] error:", res.status, err);
    throw new Error("Embedding service unavailable");
  }

  const data = await res.json();
  return data.embeddings; // float[][]
}

async function embedOne(text, taskType = "search_document") {
  const [embedding] = await embedTexts([text], taskType);
  return embedding; // float[768]
}

module.exports = { embedTexts, embedOne };
