import { CODEOPS_URL } from "./config.js";

// Re-check the stored invite on browser start; revoke access if the code was removed.
chrome.runtime.onStartup.addListener(async () => {
  const { invite } = await chrome.storage.local.get("invite");
  if (!invite) return;
  try {
    const r = await fetch(`${CODEOPS_URL}/api/invite`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: invite }) });
    if (r.status === 401) await chrome.storage.local.remove(["invite", "unlocked"]);
  } catch {
    // Offline: keep the current state until the next start.
  }
});

chrome.runtime.onMessage.addListener((m) => {
  if (m.type === "codeops:open") chrome.tabs.create({ url: CODEOPS_URL });
});
