import react from "@vitejs/plugin-react";
import { createReadStream, copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
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

function catalogFonts() {
  const source = resolve(repoRoot, "tokens/typography/fonts");
  const publicPath = "/tokens/typography/fonts";
  const allowed = new Set(["LINESeedJP-Regular.woff2", "LINESeedJP-Bold.woff2"]);

  return {
    name: "catalog-fonts",
    configureServer(server: {
      middlewares: {
        use: (
          fn: (
            req: { url?: string },
            res: { setHeader: (name: string, value: string) => void; statusCode: number },
            next: () => void,
          ) => void,
        ) => void;
      };
    }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith(`${publicPath}/`)) {
          next();
          return;
        }
        const name = url.slice(publicPath.length + 1);
        if (!allowed.has(name)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "font/woff2");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        createReadStream(resolve(source, name)).pipe(res as unknown as NodeJS.WritableStream);
      });
    },
    configurePreviewServer(server: {
      middlewares: {
        use: (
          fn: (
            req: { url?: string },
            res: { setHeader: (name: string, value: string) => void; statusCode: number },
            next: () => void,
          ) => void,
        ) => void;
      };
    }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith(`${publicPath}/`)) {
          next();
          return;
        }
        const name = url.slice(publicPath.length + 1);
        if (!allowed.has(name)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "font/woff2");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        createReadStream(resolve(source, name)).pipe(res as unknown as NodeJS.WritableStream);
      });
    },
    writeBundle(options: { dir?: string }) {
      const dest = resolve(options.dir ?? resolve(catalogRoot, "dist"), "tokens/typography/fonts");
      mkdirSync(dest, { recursive: true });
      for (const name of readdirSync(source)) {
        if (allowed.has(name)) copyFileSync(resolve(source, name), resolve(dest, name));
      }
    },
  };
}

export default defineConfig({
  plugins: [catalogFonts(), rawSchemeCss(), react(), previewFallback()],
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
