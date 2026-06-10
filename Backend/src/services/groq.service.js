const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_TIMEOUT = parseInt(process.env.GROQ_TIMEOUT_MS || "60000");
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
  };
}

// ── Non-streaming call ────────────────────────────────────────────────────────

async function callGroq(messages) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: GROQ_MODEL, messages, stream: false }),
    signal: AbortSignal.timeout(GROQ_TIMEOUT),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Groq] error:", res.status, body);
    throw Object.assign(new Error("Groq no disponible"), { code: "ai_unavailable" });
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── JSON helper (with retry) ──────────────────────────────────────────────────

function extractJson(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return JSON.parse(fenced ? fenced[1] : raw);
}

async function callGroqJson(messages) {
  const content = await callGroq(messages);
  try {
    return extractJson(content);
  } catch {
    const retry = await callGroq([
      ...messages,
      { role: "assistant", content },
      { role: "user", content: "Responde SOLO en JSON válido, sin texto adicional, sin markdown, sin explicaciones." },
    ]);
    try {
      return extractJson(retry);
    } catch {
      throw Object.assign(new Error("Respuesta JSON inválida"), { code: "invalid_json" });
    }
  }
}

// ── Streaming (OpenAI SSE format) → pipe to Express res ──────────────────────

async function streamGroqChat(messages, res) {
  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: GROQ_MODEL, messages, stream: true }),
    signal: AbortSignal.timeout(GROQ_TIMEOUT),
  });

  if (!groqRes.ok) {
    const errBody = await groqRes.text().catch(() => "");
    console.error("[Groq] streaming error:", groqRes.status, errBody);
    res.write(`data: ${JSON.stringify({ error: "No se pudo conectar con el servicio de IA" })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const reader  = groqRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;
      try {
        const data  = JSON.parse(trimmed.slice(6));
        const token = data.choices?.[0]?.delta?.content;
        if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
      } catch {
        // skip malformed chunk
      }
    }
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

module.exports = { callGroq, callGroqJson, streamGroqChat, GROQ_MODEL };
