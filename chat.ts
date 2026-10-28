// Server-side only. The Gemini key is read from the environment and never sent to the browser.
const hits: number[] = [];

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.GEMINI_API_KEY;
  const pass = process.env.APP_PASSCODE;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!key || !pass) {
    return res.status(500).json({ error: "Server not configured: set GEMINI_API_KEY and APP_PASSCODE" });
  }

  const { message, lang, passcode, history } = req.body || {};
  if (passcode !== pass) return res.status(401).json({ error: "Wrong passcode" });
  if (typeof message !== "string" || !message.trim() || message.length > 1000) {
    return res.status(400).json({ error: "Message must be 1-1000 characters" });
  }

  // Simple rate limit: 10 requests per minute (resets when the server restarts)
  const now = Date.now();
  while (hits.length && now - hits[0] > 60000) hits.shift();
  if (hits.length >= 10) return res.status(429).json({ error: "Too many requests. Wait a minute." });
  hits.push(now);

  const past = Array.isArray(history)
    ? history
        .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-6)
        .map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content.slice(0, 1000) }],
        }))
    : [];

  const system =
    "You are JARVIS, a calm, concise voice assistant. Replies are spoken aloud, so use short plain sentences with no markdown, lists or emoji. " +
    (lang === "bn" ? "The user speaks Bengali; reply in Bengali." : "Reply in the language the user speaks.") +
    " You cannot take actions yet; never claim to have done a task.";

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [...past, { role: "user", parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    );
    const data: any = await r.json();
    if (!r.ok) return res.status(502).json({ error: "Gemini API error: " + (data?.error?.message || r.status) });
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts.map((p: any) => p.text || "").join(" ").trim();
    if (!reply) return res.status(502).json({ error: "Gemini returned no text (it may have been blocked)" });
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: "Could not reach Gemini" });
  }
}
