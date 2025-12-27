export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, system, temperature, model } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(400).json({ error: "OPENAI_API_KEY not set in Vercel env vars" });

  const chosenModel = model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: chosenModel,
      temperature: typeof temperature === "number" ? temperature : 0.2,
      messages: [
        ...(system ? [{ role: "system", content: String(system) }] : []),
        { role: "user", content: String(prompt) },
      ],
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    return res.status(r.status).json({ error: "OpenAI request failed", detail: text });
  }

  const data = await r.json();
  const output = data?.choices?.[0]?.message?.content ?? "";
  return res.status(200).json({ output });
}
