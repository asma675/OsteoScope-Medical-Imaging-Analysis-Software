const DB_KEY = "osteoscope_db_v1";

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return { XRayAnalysis: [], User: [] };
    const parsed = JSON.parse(raw);
    return {
      XRayAnalysis: Array.isArray(parsed.XRayAnalysis) ? parsed.XRayAnalysis : [],
      User: Array.isArray(parsed.User) ? parsed.User : [],
    };
  } catch {
    return { XRayAnalysis: [], User: [] };
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function ensureSeed(db) {
  if (!db.User.length) {
    db.User.push({
      id: "user_1",
      name: "Demo User",
      email: "demo@example.com",
      role: "admin",
      created_date: new Date().toISOString(),
    });
  }
  return db;
}

function genId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function sortByField(data, sort) {
  if (!sort) return data;
  const desc = String(sort).startsWith("-");
  const field = desc ? String(sort).slice(1) : String(sort);

  return [...data].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];

    const ad = av ? new Date(av).getTime() : 0;
    const bd = bv ? new Date(bv).getTime() : 0;

    const cmp = ad - bd;
    return desc ? -cmp : cmp;
  });
}

function matchesWhere(row, where = {}) {
  for (const [k, v] of Object.entries(where || {})) {
    if (v === undefined) continue;
    if (row?.[k] !== v) return false;
  }
  return true;
}

function makeEntity(modelName) {
  return {
    async list(orderBy, limit) {
      const db = ensureSeed(loadDB());
      let rows = db[modelName] || [];
      rows = sortByField(rows, orderBy);
      if (typeof limit === "number") rows = rows.slice(0, limit);
      return rows;
    },

    async filter(where, orderBy, limit) {
      const db = ensureSeed(loadDB());
      let rows = (db[modelName] || []).filter((r) => matchesWhere(r, where));
      rows = sortByField(rows, orderBy);
      if (typeof limit === "number") rows = rows.slice(0, limit);
      return rows;
    },

    async get(id) {
      const db = ensureSeed(loadDB());
      return (db[modelName] || []).find((r) => r.id === id) || null;
    },

    async create(payload) {
      const db = ensureSeed(loadDB());
      const row = {
        id: genId(modelName.toLowerCase()),
        created_date: new Date().toISOString(),
        ...(payload || {}),
      };
      db[modelName] = [row, ...(db[modelName] || [])];
      saveDB(db);
      return row;
    },

    async update(id, patch) {
      const db = ensureSeed(loadDB());
      const rows = db[modelName] || [];
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`${modelName} not found`);
      rows[idx] = { ...rows[idx], ...(patch || {}) };
      db[modelName] = rows;
      saveDB(db);
      return rows[idx];
    },

    async remove(id) {
      const db = ensureSeed(loadDB());
      db[modelName] = (db[modelName] || []).filter((r) => r.id !== id);
      saveDB(db);
      return { ok: true };
    },
  };
}

export const apiClient = {
  entities: {
    XRayAnalysis: makeEntity("XRayAnalysis"),
    User: {
      ...makeEntity("User"),
      async me() {
        const db = ensureSeed(loadDB());
        saveDB(db);
        return db.User[0] || null;
      },
    },
  },

  integrations: {
    async UploadFile({ file }) {
      if (!file) throw new Error("UploadFile: missing file");
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      return { file_url: dataUrl, file_name: file.name || "upload" };
    },

    async SendEmail(_payload) {
      return { ok: true };
    },

    async InvokeLLM({ prompt, system, temperature, model }) {
      const clientKey = import.meta?.env?.VITE_OPENAI_API_KEY;

      // ✅ Local demo ONLY (exposes key to browser). Prefer server route on Vercel.
      if (clientKey) {
        const chosenModel = model || "gpt-4o-mini";
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clientKey}`,
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

        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`LLM request failed (${r.status}): ${t}`);
        }

        const data = await r.json();
        return { output: data?.choices?.[0]?.message?.content ?? "" };
      }

      // ✅ Vercel serverless route (recommended)
      const resp = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, system, temperature, model }),
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => "");
        throw new Error(`LLM request failed (${resp.status}): ${t}`);
      }

      return await resp.json();
    },
  },
};
