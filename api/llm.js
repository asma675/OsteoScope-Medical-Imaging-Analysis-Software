// Vercel Serverless Function: POST /api/llm
// Requires env var: OPENAI_API_KEY
//
// Body: { prompt: string, system?: string, temperature?: number, model?: string }
//
// Returns: { output: string }

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    const { prompt, system, temperature, model } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' (string) in request body." });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server misconfigured: OPENAI_API_KEY is not set." });
      return;
    }

    const chosenModel = model || "gpt-4o-mini";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        temperature: typeof temperature === "number" ? temperature : 0.2,
        messages: [
          ...(system ? [{ role: "system", content: String(system) }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      res.status(resp.status).json({ error: "OpenAI request failed", details: errText });
      return;
    }

    const data = await resp.json();
    const output = data?.choices?.[0]?.message?.content ?? "";
    res.status(200).json({ output });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error", details: String(e?.message || e) });
  }
}
