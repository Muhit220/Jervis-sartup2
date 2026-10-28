// Server-side only. The API key is read from the environment and never sent to the browser.
const hits = new Map<string, number[]>();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  const pass = process.env.APP_PASSCODE;
  const model = process.env.CLAUDE_MODEL || "claude-haiku-5-5";
  if (!key || !pass) {
    return res.status(500).json({ error: "Server not configured: set ANTHROPIC_API_KEY and APP_PASSCODE" });
  }

  const { message, lang, passcode, history } = req.body || {};
  if (passcode !== pass) return res.status(401).json({ error: "Wrong passcode" });
  if (typeof message !== "string" || !message.trim() || message.length > 1000) {
    return res.status(400).json({ error: "Message must be 1-1000 characters" });
  }

  // Simple rate limit: 20 requests per minute (resets when the server restarts)
  const now = Date.now();
  const recent = (hits.get("all") || []).filter((t) => now - t < 60000);
  if (recent.length >= 20) return res.status(429).json({ error: "Too many requests. Wait a minute." });
  recent.push(now);
  hits.set("all", recent);

  const past = Array.isArray(history)
    ? history
        .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-6)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  const system =
    "You are JARVIS, a calm, concise voice assistant. Replies are spoken aloud, so use short plain sentences with no markdown, lists or emoji. " +
    (lang === "bn" ? "The user speaks Bengali; reply in Bengali." : "Reply in the language the user speaks.") +
    " You cannot take actions yet; never claim to have done a task.";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        system,
        messages: [...past, { role: "user", content: message }],
      }),
    });
    const data: any = await r.json();
    if (!r.ok) return res.status(502).json({ error: "Claude API error: " + (data?.error?.message || r.status) });
    const reply = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join(" ");
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: "Could not reach Claude" });
  }
}
