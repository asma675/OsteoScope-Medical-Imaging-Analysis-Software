export default async function handler(req, res) {
    try {
      if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  
      const { prompt } = req.body || {};
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You are a careful medical assistant. Provide educational info only." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });
  
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      return res.status(200).json({ text });
    } catch (e) {
      return res.status(500).json({ error: "Server error", detail: String(e) });
    }
  }
  