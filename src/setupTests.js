import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// lucide-svelte diganti ikon palsu agar pengujian ringan dan stabil.
vi.mock("lucide-svelte", async () => {
  const { default: IconStub } = await import("./test-stubs/IconStub.svelte");
  const names = [
    "ArrowLeft", "Camera", "ExternalLink", "EyeOff", "Globe", "Link2", "Lock",
    "LogOut", "Menu", "Pencil", "Plus", "Search", "Trash2", "User", "Users", "X",
  ];
  return Object.fromEntries(names.map((name) => [name, IconStub]));
});

// Editor markdown Toast UI tidak dijalankan di jsdom; instance dicatat di globalThis.
vi.mock("@toast-ui/editor", () => {
  class Editor {
    constructor(options) {
      this.options = options;
      this.destroy = vi.fn();
      this.getMarkdown = vi.fn(() => "# markdown baru");
      globalThis.__toastEditors.push(this);
    }

    static factory(options) {
      return new Editor(options);
    }
  }
  return { default: Editor };
});

globalThis.__toastEditors = [];

afterEach(() => {
  globalThis.__toastEditors = [];
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.unstubAllGlobals();
});
