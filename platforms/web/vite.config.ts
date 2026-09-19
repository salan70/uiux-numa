import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// experiments/ 配下の variant を読むため、リポジトリルートまで配信を許可する。
const repoRoot = new URL("../..", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    // experiments/ は platforms/web/ の外にあり node_modules を持たないため、
    // react と react-dom はこのプロジェクトの 1 つのコピーに解決する。
    // tsconfig.json の paths も同じ理由で置いている。
    dedupe: ["react", "react-dom", "@base-ui/react"],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
