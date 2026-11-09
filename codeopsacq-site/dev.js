// Local preview server: serves index.html and saves applications to .data/applications.jsonl.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { validateApplication } = require("./api/validate");

const PORT = Number(process.env.PORT || 3400);
const DATA = path.join(__dirname, ".data");
fs.mkdirSync(DATA, { recursive: true });

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/apply") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const v = validateApplication(Object.fromEntries(new URLSearchParams(body)));
      res.setHeader("content-type", "application/json");
      if (v.errors) return res.writeHead(400).end(JSON.stringify({ ok: false, errors: v.errors }));
      if (!v.spam) fs.appendFileSync(path.join(DATA, "applications.jsonl"), JSON.stringify({ ...v.app, received_at: new Date().toISOString() }) + "\n");
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?") || req.url.startsWith("/#"))) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }
  res.writeHead(404).end("Not found");
}).listen(PORT, "0.0.0.0", () => console.log(`CodeOpsAcq site preview on http://localhost:${PORT}`));
