// Invite check for the CodeOps Chrome extension. Codes are stored only as SHA-256 hashes in INVITE_CODE_HASHES.
const { createHash, timingSafeEqual } = require("node:crypto");

const sha = (s) => createHash("sha256").update(String(s).trim().toUpperCase()).digest("hex");
const tries = new Map();

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "unknown";
  const now = Date.now();
  const t = (tries.get(ip) || []).filter((x) => now - x < 10 * 60_000);
  if (t.length >= 10) return res.status(429).json({ ok: false, error: "Too many attempts. Try again in 10 minutes." });
  tries.set(ip, [...t, now]);

  const allowed = String(process.env.INVITE_CODE_HASHES || "").split(",").map((h) => h.trim()).filter(Boolean);
  if (!allowed.length) return res.status(503).json({ ok: false, error: "Invites are not configured yet." });

  const code = req.body && typeof req.body === "object" ? req.body.code : undefined;
  if (typeof code !== "string" || code.length < 6 || code.length > 64) return res.status(400).json({ ok: false, error: "Enter your invite code." });
  const h = Buffer.from(sha(code), "hex");
  const ok = allowed.some((a) => a.length === 64 && timingSafeEqual(Buffer.from(a, "hex"), h));
  return ok ? res.status(200).json({ ok: true }) : res.status(401).json({ ok: false, error: "That invite code isn't valid." });
};
