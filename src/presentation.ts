import "./reveal.css";
import "./catppuccin.css";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.js";
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.js";
import RevealHighlight from "reveal.js/plugin/highlight/highlight.js";
import RevealZoom from "reveal.js/plugin/zoom/zoom.js";

import "@motion-canvas/core";
import "@motion-canvas/player";

Reveal.initialize({
  hash: true,
  plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealZoom],
  slideNumber: "c/t",
});

(function prependBase() {
  const base = import.meta.env.BASE_URL;
  if (!base) {
    return;
  }
  document.querySelectorAll("motion-canvas-player").forEach((player) => {
    let url = player.getAttribute("src");
    if (url?.startsWith("/")) {
      url = base + url.slice(1);
      const newElement = document.createElement("motion-canvas-player");
      newElement.setAttribute("auto", player.getAttribute("auto") ?? "true");
      newElement.setAttribute("src", url);
      player.replaceWith(newElement);
    }
  });
})();
