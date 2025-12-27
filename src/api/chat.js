export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const { prompt } = req.body || {};
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Missing OPENAI_API_KEY (add it in Vercel Environment Variables)",
        });
      }
  
      // OpenAI HTTP call (server-side)
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
        }),
      });
  
      const data = await r.json();
  
      if (!r.ok) {
        return res.status(r.status).json({
          error: data?.error?.message || "OpenAI request failed",
          details: data,
        });
      }
  
      // `responses` API returns text in output arrays; this extracts it safely
      const text =
        data?.output?.[0]?.content?.map((c) => c?.text).filter(Boolean).join("") ||
        "";
  
      return res.status(200).json({ text });
    } catch (e) {
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  }
  