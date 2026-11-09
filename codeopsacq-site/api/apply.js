// Receives the "Tell us where the agency is stuck" form and stores each application privately in Vercel Blob.
const { put } = require("@vercel/blob");
const { randomUUID } = require("node:crypto");
const { validateApplication } = require("./validate");

const hits = new Map();

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: "Too many submissions. Try again later." });
  hits.set(ip, [...recent, now]);

  const fields = typeof req.body === "string" ? Object.fromEntries(new URLSearchParams(req.body)) : req.body || {};
  const v = validateApplication(fields);
  if (v.spam) return res.status(200).json({ ok: true });
  if (v.errors) return res.status(400).json({ ok: false, errors: v.errors });

  const at = new Date().toISOString();
  const record = { ...v.app, received_at: at, user_agent: String(req.headers["user-agent"] || "").slice(0, 200), referer: String(req.headers.referer || "").slice(0, 300) };
  await put(`applications/${at.slice(0, 10)}/${at.slice(11, 19).replace(/:/g, "")}-${randomUUID().slice(0, 8)}.json`, JSON.stringify(record, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return res.status(200).json({ ok: true });
};
