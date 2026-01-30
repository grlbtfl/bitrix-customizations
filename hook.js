// file: bitrix-customizations/hook.js
// он перехватывает проигрывание звука и подменяет src

(() => {
  const TARGET_END = "/bitrix/js/im/audio/new-message-1.mp3";

  // Беру URL подмены из data-атрибута тега <script>, который меня внедрил
  const current = document.currentScript;
  const replacementUrl = current?.dataset?.replacementUrl || "";

  if (!replacementUrl) return;

  const origPlay = HTMLMediaElement.prototype.play;

  HTMLMediaElement.prototype.play = function (...args) {
    try {
      const src = (this.currentSrc || this.src || "");
      if (src.endsWith(TARGET_END)) {
        if (this.src !== replacementUrl) {
          this.src = replacementUrl;
        }
      }
    } catch (e) {}

    return origPlay.apply(this, args);
  };
})();
