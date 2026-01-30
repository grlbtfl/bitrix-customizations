// file: bitrix-customizations/content.js
// она берёт replacementUrl из storage (если задан), иначе из config.json, затем подключает hook.js
// EN: it takes replacementUrl from storage (if set), otherwise from config.json, then injects hook.js

(() => {
  const api = window.browser || window.chrome;

  function getStorage() {
    // она предпочитает sync, но если недоступно — упадёт на local
    // EN: it prefers sync; if unavailable it falls back to local
    return api.storage?.sync || api.storage?.local;
  }

  async function loadFromStorage() {
    const store = getStorage();
    const data = await store.get({ replacementUrl: "" });
    return (data.replacementUrl || "").trim();
  }

  async function loadFromConfigJson() {
    const url = api.runtime.getURL("config.json");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    const cfg = await res.json();
    return (cfg.replacementUrl || "").trim();
  }

  function injectHook(replacementUrl) {
    if (!replacementUrl) return;

    const s = document.createElement("script");
    s.src = api.runtime.getURL("hook.js");
    s.dataset.replacementUrl = replacementUrl;

    (document.documentElement || document.head).appendChild(s);
    s.onload = () => s.remove();
  }

  (async () => {
    try {
      const fromStorage = await loadFromStorage();
      const replacementUrl = fromStorage || (await loadFromConfigJson());

      if (!replacementUrl) {
        console.warn("[Bitrix Sound Replacer] replacementUrl is empty (set it in Options)");
        return;
      }

      injectHook(replacementUrl);
    } catch (err) {
      console.warn("[Bitrix Sound Replacer] init failed:", err);
    }
  })();
})();