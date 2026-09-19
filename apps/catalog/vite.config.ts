import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const catalogRoot = fileURLToPath(new URL(".", import.meta.url));

function previewFallback() {
  return {
    name: "preview-fallback",
    configureServer(server: {
      middlewares: {
        use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void;
      };
    }) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        if (path === "/preview" || path.startsWith("/preview/")) {
          req.url = "/preview.html";
        }
        next();
      });
    },
    configurePreviewServer(server: {
      middlewares: {
        use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void;
      };
    }) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        if (path === "/preview" || path.startsWith("/preview/")) {
          req.url = "/preview.html";
        }
        next();
      });
    },
  };
}

function rawSchemeCss() {
  const virtualPrefix = "\0raw-scheme:";

  return {
    name: "raw-scheme-css",
    enforce: "pre" as const,
    resolveId(id: string, importer?: string) {
      const [file, query = ""] = id.split("?");
      if (!query.split("&").some((item) => item === "raw" || item.startsWith("raw="))) return;
      const absoluteFile =
        importer && file.startsWith(".") ? resolve(dirname(importer), file) : file;
      if (!/\/experiments\/color-schemes\/variants\/[^/]+\/scheme\.css$/.test(absoluteFile)) return;
      return `${virtualPrefix}${encodeURIComponent(absoluteFile)}.js`;
    },
    load(id: string) {
      if (!id.startsWith(virtualPrefix)) return;
      const file = decodeURIComponent(id.slice(virtualPrefix.length, -3));
      return {
        code: `export default ${JSON.stringify(readFileSync(file, "utf8"))}`,
        map: { mappings: "" },
        moduleType: "js",
      };
    },
    transform(code: string, id: string) {
      if (!id.startsWith(virtualPrefix)) return;
      return { code, map: null, moduleType: "js" as const };
    },
  };
}

export default defineConfig({
  plugins: [rawSchemeCss(), react(), previewFallback()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        preview: fileURLToPath(new URL("./preview.html", import.meta.url)),
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    root: catalogRoot,
  },
});
