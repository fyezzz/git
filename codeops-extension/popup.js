import { CODEOPS_URL } from "./config.js";
const $ = (id) => document.getElementById(id);
const store = chrome.storage.local;

async function render() {
  const { unlocked, leads = [], showMark = true } = await store.get(["unlocked", "leads", "showMark"]);
  $("gate").hidden = !!unlocked; $("app").hidden = !unlocked; $("lock").hidden = !unlocked;
  if (!unlocked) return;
  $("showMark").checked = showMark;
  $("count").textContent = leads.length ? `(${leads.length})` : "";
  $("list").replaceChildren(...leads.slice().reverse().map((l) => {
    const li = document.createElement("li");
    const x = Object.assign(document.createElement("button"), { className: "x", textContent: "✕", title: "Delete" });
    x.onclick = async () => { const { leads: all = [] } = await store.get("leads"); await store.set({ leads: all.filter((y) => y.id !== l.id) }); render(); };
    const b = Object.assign(document.createElement("b"), { textContent: l.name });
    const a = Object.assign(document.createElement("a"), { href: l.url, textContent: l.url, target: "_blank" });
    li.append(x, b, document.createElement("br"), a);
    return li;
  }));
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && !$("name").value) $("name").value = (tab.title || "").split(/[|\-–·]/)[0].trim().slice(0, 120);
  if (tab?.id && !$("notes").value) {
    try { const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => String(getSelection()) }); if (result) $("notes").value = result.slice(0, 2000); } catch { /* restricted page */ }
  }
}

$("inviteForm").onsubmit = async (e) => {
  e.preventDefault();
  const code = $("code").value.trim().toUpperCase();
  const btn = e.submitter; btn.disabled = true; $("gateMsg").className = "msg"; $("gateMsg").textContent = "Checking…";
  try {
    const r = await fetch(`${CODEOPS_URL}/api/invite`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) { $("gateMsg").className = "msg err"; $("gateMsg").textContent = d.error || `Couldn't verify (${r.status}).`; return; }
    await store.set({ unlocked: true, invite: code });
    render();
  } catch { $("gateMsg").className = "msg err"; $("gateMsg").textContent = "Can't reach CodeOps. Check your connection."; }
  finally { btn.disabled = false; }
};

$("capture").onsubmit = async (e) => {
  e.preventDefault();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { leads = [] } = await store.get("leads");
  leads.push({ id: crypto.randomUUID(), name: $("name").value.trim(), contact: $("contact").value.trim(), notes: $("notes").value.trim(), url: tab?.url || "", title: tab?.title || "", at: new Date().toISOString() });
  await store.set({ leads });
  $("capture").reset(); $("capMsg").className = "msg ok"; $("capMsg").textContent = "✓ Lead saved"; render();
};

$("csv").onclick = async () => {
  const { leads = [] } = await store.get("leads");
  const cell = (v) => { const s = String(v ?? ""); return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`; };
  const csv = ["name,contact,notes,url,title,captured_at", ...leads.map((l) => [l.name, l.contact, l.notes, l.url, l.title, l.at].map(cell).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: `codeops-leads-${new Date().toISOString().slice(0, 10)}.csv` }).click();
};
$("open").onclick = () => chrome.tabs.create({ url: CODEOPS_URL });
$("lock").onclick = async () => { await store.remove(["unlocked", "invite"]); render(); };
$("showMark").onchange = (e) => store.set({ showMark: e.target.checked });
render();
