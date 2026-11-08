(() => {
  if (window.top !== window || document.getElementById("codeops-mark-host")) return;
  chrome.storage.local.get(["unlocked", "showMark"]).then(({ unlocked, showMark }) => {
    if (!unlocked || showMark === false) return;
    const host = document.createElement("div");
    host.id = "codeops-mark-host";
    host.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:2147483646";
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `<style>
      a{display:block;width:34px;height:34px;filter:drop-shadow(0 0 8px #02ef7d88);transition:transform .2s,filter .2s;opacity:.85}
      a:hover{transform:scale(1.1);filter:drop-shadow(0 0 14px #02ef7dcc);opacity:1}
    </style><a href="#" title="CodeOps · capture this page (click the toolbar icon)" aria-label="CodeOps">${MARK}</a>`;
    root.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.sendMessage({ type: "codeops:open" }); });
    document.documentElement.appendChild(host);
  });
  var MARK = `<svg viewBox="0 0 40 40" width="34" height="34"><defs><linearGradient id="e" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#b6ffd9"/><stop offset=".45" stop-color="#02ef7d"/><stop offset="1" stop-color="#0a6b3d"/></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="9" fill="#060a08" stroke="url(#e)" stroke-width="2.5"/><g fill="none" stroke="#5dff9f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 11h-3.5v18h3.5"/><path d="M19.5 14l8 6-8 6"/></g></svg>`;
})();
