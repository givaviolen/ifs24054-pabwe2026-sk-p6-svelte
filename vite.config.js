import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

function inlineCss() {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        let out = html;
        for (const [file, chunk] of Object.entries(ctx.bundle)) {
          if (!file.endsWith(".css") || chunk.type !== "asset") continue;
          const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const linkTag = new RegExp(`<link[^>]*href="[^"]*${escaped}"[^>]*>`);
          out = out.replace(linkTag, () => `<style>${chunk.source}</style>`);
        }
        return out;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      svelteTesting(),
      inlineCss(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: true,
      target: "esnext",
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "http://localhost:8000/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "src/test-stubs/**",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        // lines & functions tetap 100%. Statements/branches diberi toleransi kecil karena
        // compiler Svelte menghasilkan cabang internal (mis. `?? ""`) yang tidak bisa dites
        // dan hasilnya bergeser mengikuti versi dependency di Jenkins.
        thresholds: {
          lines: 100,
          functions: 100,
          statements: 99,
          branches: 95,
        },
      },
    },
  };
});