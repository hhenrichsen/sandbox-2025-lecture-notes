import "./reveal.css";
import "./catppuccin.css";
import "@motion-canvas/core";
import "@motion-canvas/player";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.js";
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.js";
import RevealZoom from "reveal.js/plugin/zoom/zoom.js";

let plugins = [RevealMarkdown, RevealNotes, RevealZoom];

// If there are code blocks (```), add the highlight plugin:
if (document.querySelector("textarea[data-template]")) {
  const template = document.querySelector(
    "textarea[data-template]",
  )?.textContent;
  if (template?.includes("```")) {
    const { default: RevealHighlight } = await import(
      "reveal.js/plugin/highlight/highlight.js"
    );
    plugins.push(RevealHighlight);
  }
}

Reveal.initialize({
  hash: true,
  plugins,
  slideNumber: "c/t",
});
