// file: bitrix-customizations/options.js
// она читает/сохраняет URL звука в storage и показывает статус
// EN: it reads/saves the sound URL in storage and shows status

(() => {
  const api = window.browser || window.chrome;

  const input = document.getElementById("replacementUrl");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const status = document.getElementById("status");

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "status " + (kind || "");
  }

  function getStorage() {
    // она предпочитает sync, но если недоступно — упадёт на local
    // EN: it prefers sync; if unavailable it falls back to local
    return api.storage?.sync || api.storage?.local;
  }

  async function load() {
    const store = getStorage();
    const data = await store.get({ replacementUrl: "" });
    input.value = data.replacementUrl || "";
    setStatus("");
  }

  function isValidUrl(value) {
    if (!value) return true; // пустое разрешаем (будет fallback)
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function save() {
    const value = input.value.trim();

    if (!isValidUrl(value)) {
      setStatus("Некорректный URL. Используй http/https.", "err");
      return;
    }

    const store = getStorage();
    await store.set({ replacementUrl: value });
    setStatus("Сохранено. Обнови вкладку Bitrix24, чтобы применилось.", "ok");
  }

  async function reset() {
    const store = getStorage();
    await store.set({ replacementUrl: "" });
    input.value = "";
    setStatus("Сброшено. Будет использоваться config.json (если он задан).", "ok");
  }

  saveBtn.addEventListener("click", () => save().catch(e => setStatus(String(e), "err")));
  resetBtn.addEventListener("click", () => reset().catch(e => setStatus(String(e), "err")));

  load().catch(e => setStatus(String(e), "err"));
})();
